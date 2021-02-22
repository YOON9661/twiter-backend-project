const express = require("express");
const multer = require('multer');
const path = require('path');

const { Video, User, Comment } = require("../models");

const { isLoggedIn } = require("./middleware");

const router = express.Router();

// video
const uploadVideo = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, "videos/");
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    })
})
router.post("/url", uploadVideo.single("video"), (req, res) => {
    console.log(req.file)
    res.json({ videourl: `/videos/${req.file.filename}` })
})

// thumbnail
const uploadThumbnail = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    })
});
router.post("/thumbnail/url", uploadThumbnail.single("thumbnail"), (req, res) => {
    console.log(req.file);
    res.json({ thumbnailurl: `/img/${req.file.filename}` });
})


// upload
const upload2 = multer();
router.post("/upload", upload2.none(), async (req, res, next) => {
    try {
        const newVideo = await Video.create({
            UserId: req.user.id,
            title: req.body.title,
            content: req.body.description,
            imagepath: req.body.thumbnailurl,
            videopath: req.body.videourl
        });
        res.status(201).json(newVideo);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// 모든 비디오 렌더링
router.get("/", async (req, res, next) => {
    try {
        const pages = await Video.findAll({
            order: [["createdAt", "DESC"]],
            include: [{
                model: User,
                attributes: ["id", "nickname"]
            }]
        });
        res.status(201).json(pages);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// 비디오 더보기 기능
router.get("/:id", async (req, res, next) => {
    try {
        const video = await Video.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: User,
                attributes: ["id", "nickname"]
            }, {
                model: User,
                through: "VideoLike",
                as: "VideoLikers"
            }, {
                model: User,
                through: "VideoDisike",
                as: "VideoDislikers"
            }, {
                model: Comment,
                order: [["createdAt", "DESC"]],
                include: [{
                    model: User,
                    attributes: ["id", "nickname"]
                }]
            }]
        });
        if (!video) {
            return res.status(404).send("not found");
        }
        res.status(201).json(video);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// 비디오 삭제
router.post("/:id/delete", async (req, res, next) => {
    try {
        const video = await Video.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!video) {
            return res.status(404).send("not found");
        }
        await video.destroy();
        res.status(201).json({ userId: req.user.id, videoId: req.params.id, success: true });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// 비디오 수정
router.post("/:id/update", async (req, res, next) => {
    try {
        const video = await Video.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!video) {
            return res.status(404).send("not found");
        }
        await video.destory();
        res.status(201).json({ userId: req.user.id, videoId: req.params.id, success: true });
    } catch (err) {
        console.error(err);
        next(err);
    }
});



// 댓글
// 댓글 생성
router.post("/comment/:id", async (req, res, next) => {
    try {
        const newComment = await Comment.create({
            content: req.body.text,
            VideoId: req.params.id,
            UserId: req.user.id
        });
        res.status(201).json(newComment);
    } catch (err) {
        console.error(err);
        next(err);
    }
});
// 댓글 삭제
router.post("/comment/delete/:id", async (req, res, next) => {
    try {
        const comment = await Comment.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!comment) {
            return res.status(404).send("no comment exist");
        }
        await comment.destory();
        res.status(201).json({ commentDelete: true, commentId: req.params.id });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;