var express = require('express');
var router = express.Router();


// year/month/id
router.get('/:year/:month/:id', function (req, res, next) {
    let year = req.params.year;
    let month = req.params.month;
    let id = req.params.id;

    // get blog markdown file
    let fs = require('fs');
    let path = require('path');
    let blogPath = path.join(__dirname, '../public/blogs', year, month, id + '.md');
    console.log(blogPath)
    fs.readFile(blogPath, 'utf8', function (err, data) {
        if (err) {
            res.render('error', {
                message: "Blog not found",
                error: {
                    status: 404
                }
            });
        } else {
            res.render('blog', {
                blog: data
            });
        }
    });
});

module.exports = router;
