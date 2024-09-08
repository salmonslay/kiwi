const express = require('express');
const router = express.Router();
const marked = require('marked');
const matter = require('gray-matter');


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
            res.render('blog', {
                html: html,
                metadata: metadata,
            });
        }
    });
});

module.exports = router;
