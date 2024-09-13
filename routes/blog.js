const express = require('express');
const router = express.Router();
const marked = require('marked');
const matter = require('gray-matter');

router.get('/', function (req, res, next) {
    res.redirect('/#blog');
});

// year/month/id
router.get('/:id', function (req, res, next) {
    let id = req.params.id;

    // get blog markdown file
    let fs = require('fs');
    let path = require('path');
    let blogPath = path.join(__dirname, '../public/blogs', id + '.md');
    fs.readFile(blogPath, 'utf8', function (err, data) {
        if (err) {
            res.render('error', {
                message: "Blog not found",
                error: {
                    status: 404
                }
            });
        } else {
            const metadata = matter(data);
            let html = marked.parse(metadata.content);

            metadata.data.title = metadata.data.title || "No title";
            metadata.data.date = metadata.data.date || new Date(0);
            metadata.data.updated = metadata.data.updated || metadata.data.date;
            metadata.data.draft = metadata.data.draft || true; // only explicitly set to false if not a draft
            metadata.data.author = metadata.data.author || "Sofia Lindgren";
            metadata.data.summary = metadata.data.summary || ""; // no summary needed, just leave empty
            metadata.data.tags = metadata.data.tags || [];

            res.render('blog', {
                html: html,
                metadata: metadata,
            });
        }
    });
});

module.exports = router;
