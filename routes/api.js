const express = require('express');
const router = express.Router();
const marked = require('marked');
const matter = require('gray-matter');
const fs = require('fs');
const fetch = require('node-fetch-commonjs');
require('dotenv').config()

const defaultPostsPerPage = 20;
const postCacheTime = 1800000; // 30 minutes
let postCache = {};

/**
 * Returns a JSON object containing all blog posts on the site.
 * This code is from LavenderSplatter, another project of mine (closed-source).
 * @param refresh {Boolean} If true, will force a refresh of the blog posts.
 * @param user {String} If specified, will only return posts by the specified user.
 * @param query {String} If specified, will only return posts that contain the specified query.
 * @param sort {String} If specified, will sort the posts by the specified field. Can be "date", or "title".
 * @param order {String} If specified, will sort the posts in the specified order. Can be "asc" or "desc".
 * @param limit {Number} If specified, will limit the number of posts returned.
 * @param offset {Number} If specified, will offset the number of posts returned.
 * @param page {Number} If specified, will set limit and offset accordingly.
 */
router.get('/posts', function (req, res, next) {
    let refresh = req.query.refresh === "true" ||
        process.env.NODE_ENV === "development"; // force refresh in development or if refresh=true

    let cacheKey = JSON.stringify({
        user: req.query.user,
        query: req.query.query,
    });

    // check if posts are cached and return them if they are
    if (postCache[cacheKey] && (Date.now() - postCache[cacheKey].updatedAt) < postCacheTime && !refresh) {
        let filteredPosts = applyFilters(postCache[cacheKey], req.query);
        filteredPosts.cached = true;
        res.status(200).json(filteredPosts);
    } else {
        postCache[cacheKey] = {
            updatedAt: Date.now(),
            posts: []
        };

        // go through all .md files in /public/blogs and parse them
        fs.readdir('./public/blogs', (err, files) => {
            const blogFetches = files.map(file => {
                // filter out files that aren't markdown
                if (!file.endsWith(".md")) return Promise.resolve();

                // call /blog/:id to get the metadata
                return fetch(`${process.env.API_URL}/api/posts/${file.replace(".md", "")}`)
                    .then(response => response.json())
                    .then(json => {
                        console.log(json);

                        if (json.metadata.draft)
                            return; // don't add draft posts

                        let user = req.query.user;
                        if (user && json.metadata.author !== user)
                            return; // don't add blog if it's not by the specified user

                        let query = req.query.query;
                        if (query) {
                            query = query.toLowerCase();
                            if (!json.metadata.title.toLowerCase().includes(query))
                                return;
                        }

                        // add a few bonus copies of the posts if --fake is specified
                        let times = process.argv.includes("--fake") ? 100 : 1;
                        for (let i = 0; i < times; i++)
                            postCache[cacheKey].posts.push(json);
                    });
            });

            Promise.all(blogFetches)
                .then(() => {
                    let filteredPosts = applyFilters(postCache[cacheKey], req.query);
                    filteredPosts.cached = false;
                    res.status(200).json(filteredPosts);
                })
                .catch(error => {
                    console.error(error);
                    res.render('error', {
                        message: "Unable to retrieve posts",
                        error: {
                            status: 500,
                        }
                    });
                });
        });
    }
});

/**
 * Takes a JSON object of posts and applies the specified limit, offset, sort, and order.
 * @param posts {Object} The posts to apply the filters to.
 * @param query {Object} The query object containing the limit, offset, sort, and order.
 */
function applyFilters(posts, query) {
    let page = parseInt(query.page) || -1;

    // if we miss both limit & offset, default to page 1
    if (!parseInt(query.limit) && !parseInt(query.offset) && page < 1)
        page = 1;

    let limit;
    let offset;

    // if we have a page that takes priority over limit & offset
    if (page > 0) {
        limit = defaultPostsPerPage;
        offset = defaultPostsPerPage * (page - 1);
    } else {
        // respect limit & offset if there's no page
        limit = parseInt(query.limit) || defaultPostsPerPage;
        offset = parseInt(query.offset) || 0;
    }

    let postArray = posts.posts || [];
    let sort = query.sort || "date";
    let order = query.order || "desc";

    if (sort === "date") {
        postArray.sort((a, b) => {
            return new Date(b.metadata.date) - new Date(a.metadata.date);
        });
    } else if (sort === "score") {
        postArray.sort((a, b) => {
            return b.metadata.score - a.metadata.score;
        });
    } else if (sort === "title") {
        postArray.sort((a, b) => {
            return a.metadata.title.localeCompare(b.metadata.title);
        });
    }

    if (order === "asc") {
        postArray.reverse();
    }

    // create a copy of the posts object and only include the specified limit and offset
    let filteredPosts = Object.assign({}, posts);
    filteredPosts.posts = postArray.slice(offset, offset + limit);

    if (page) {
        filteredPosts.page = page;
        filteredPosts.pages = Math.ceil(postArray.length / defaultPostsPerPage);

        filteredPosts.totalPosts = postArray.length;
    }

    return filteredPosts;
}

/**
 * Returns a JSON object containing the metadata and HTML of the specified blog post.
 * @param id {String} The ID (name) of the blog post to retrieve.
 * @param html {Boolean} If true, will return the HTML of the post. If false, this will be an empty string.
 * @param md {Boolean} If true, will return the Markdown of the post. If false, this will be an empty string.
 */
router.get('/posts/:id', function (req, res, next) {
    let id = req.params.id;
    let includeHtml = req.query.html === "true";
    let includeMd = req.query.md === "true";
    let file = `./public/blogs/${id}.md`;

    let fileExists = fs.existsSync(file);

    if (fileExists) {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({
                    success: false,
                    message: "Unable to read blog post from file"
                });
            }

            const metadata = matter(data);
            let html = marked.parse(metadata.content);

            metadata.data.title = metadata.data.title || "No title";
            metadata.data.date = metadata.data.date || new Date(0);
            metadata.data.updated = metadata.data.updated || metadata.data.date;
            metadata.data.draft = metadata.data.draft === undefined ? true : metadata.data.draft; // only explicitly set to false if not a draft
            metadata.data.author = metadata.data.author || "Sofia Lindgren";
            metadata.data.summary = metadata.data.summary || ""; // no summary needed, just leave empty
            metadata.data.tags = metadata.data.tags || [];
            metadata.data.thumbnail = metadata.data.thumbnail || "/img/meta.png";

            res.status(200).json({
                success: true,
                metadata: metadata.data,
                html: includeHtml ? html : "",
                md: includeMd ? metadata.content : "",
                slug: id,
            });
        });
    } else {
        res.status(404).json({
            success: false,
            message: "Review not found",
        });
    }
});

module.exports = router;