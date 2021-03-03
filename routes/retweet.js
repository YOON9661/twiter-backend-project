const express = require("express");

const { Post } = require("../models");

const { isLoggedIn } = require("./middleware");

const router = express.Router();


router.post("/:postId", isLoggedIn, async (req, res, next) => {
    try {
        const RetweetTargetPost = await Post.findOne({
            where: {
                id: req.params.postId
            }
        });
        if (!RetweetTargetPost) {
            return res.status(404).send("no post exist");
        }
        const retweetingPost = await Post.create({
            UserId: req.user.id,
            RetweetId: req.params.postId
            // req.params.postId
        });
        console.log(retweetingPost);
        res.status(201).json({ retweetingPost });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;