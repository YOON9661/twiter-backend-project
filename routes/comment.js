const express = require("express");

const { Comment } = require("../models");

const { isLoggedIn } = require("./middleware");

const router = express.Router();


router.post("/:id/like", isLoggedIn, async (req, res, next) => {
    try {
        const comment = await Comment.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!comment) {
            return res.status(404).send("no comment exist");
        }
        comment.addCommentLikers(req.user.id);
        res.status(201).json({
            addSuccess: true,
            commentId: req.params.id,
            userId: req.user.id
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.delete("/:id/like/delete", isLoggedIn, async (req, res, next) => {
    try {
        const comment = await Comment.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!comment) {
            return res.status(404).send("no comment exist");
        }
        comment.removeCommentLikers(req.user.id);
        res.status(201).json({
            removeSuccess: true,
            commentId: req.params.id,
            userId: req.user.id
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});


module.exports = router;