const express = require("express");

const { Post } = require("../models");

const { isLoggedIn } = require("./middleware");

const router = express.Router();


router.post("/:id", isLoggedIn, async (req, res, next) => {
    try {
        const myPost = await Post.create({
            UserId: req.user.id
        });
        const retweetPost = await Post.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!retweetPost) {
            return res.status(404).send("no post exist");
        }
        myPost.addRetweet(req.params.id);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;