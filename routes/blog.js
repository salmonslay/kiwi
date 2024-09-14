const express = require('express');
const router = express.Router();
const marked = require('marked');
const matter = require('gray-matter');
const fetch = require('node-fetch-commonjs');

router.get('/', function (req, res, next) {
    res.redirect('/#blog');
});

router.get('/:id', function (req, res, next) {
    let id = req.params.id;

    fetch(`${process.env.API_URL}/api/posts/${id}?html=true`).then(response => {
        if (response.status === 404) {
            res.status(404).render('error', {
                message: "This blog post does not exist!",
                error: {status: 404}
            });
            return;
        }

        response.json().then(json => {
            res.render('blog', {
                html: json.html,
                metadata: json.metadata,
                slug: json.slug
            });
        });
    });

});

module.exports = router;
