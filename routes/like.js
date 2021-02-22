const express = require("express");

const router = express.Router();

const { Video, User, Comment } = require("../models");

const { isLoggedIn } = require("./middleware");

// 좋아요 생성
router.post("/video/:id/create", isLoggedIn, async (req, res, next) => {
    try {
        const video = await Video.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!video) {
            return res.status(404).send("cannot find video");
        }
        //req.user.id
        await video.addVideoLikers(req.user.id);
        res.status(201).json({ videoLike: true, videoId: req.params.id, UserId: req.user.id });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// 좋아요 취소
router.post("/video/:id/delete", isLoggedIn, async (req, res, next) => {
    try {
        const video = await Video.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!video) {
            return res.status(404).json({ data: "no post exist" });
        }
        await video.removeVideoLikers(req.user.id);
        res.status(201).json({ success: true, videoId: req.params.id, UserId: req.user.id });
    } catch (err) {
        console.error(err);
        next(err);
    }
});



module.exports = router;