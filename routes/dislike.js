const express = require("express");

const router = express.Router();

const { Video } = require("../models");

const { isLoggedIn } = require("./middleware");

// 바디오 싫어요
router.post("/video/:id/create", async (req, res, next) => {
    try {
        const video = await Video.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!video) {
            return res.status(404).send("cannot find video");
        }
        await video.addVideoDislikers(req.user.id);
        res.status(201).send("ok!");
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// 비디오 싫어요 취소
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
        await video.removeVideoDislikers(req.user.id);
        res.status(201).json({ success: true, videoId: req.params.id, UserId: req.user.id });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;