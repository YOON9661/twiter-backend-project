const express = require("express");
const multer = require("multer");
const path = require("path");

const { Post, User, Comment, Image } = require("../models");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            order: [["createdAt", "DESC"]],
            include: [{
                model: User,
                attributes: ["id", "nickname"]
            }, {
                model: User,
                through: "PostLike",
                as: "PostLikers",
                attributes: ["id", "nickname"]
            }, {
                model: Comment,
                include: {
                    model: User,
                    attributes: ["id", "nickname"]
                }
            }, {
                model: Post,
                as: "Retweet",
                include: {
                    model: User,
                    attributes: ["id", "nickname"]
                }
            }],
        });
        res.status(201).json(posts);
    } catch (err) {
        console.error(err);
        next(err);
    }
});


// file data
// preview의 목적
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, "uploads/");
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    })
});

router.post("/img", upload.single("img"), (req, res) => {
    console.log(req.file);
    res.status(201).json({ url: `http://localhost:3001/img/${req.file.filename}` });
});

// upload의 목적
const upload2 = multer();
router.post("/upload", upload2.none(), async (req, res, next) => {
    try {
        const post = await Post.create({
            content: req.body.description,
            UserId: req.user.id
        });
        if (req.body.imagepath !== null) {
            const image = await Image.create({
                imagepath: req.body.imageurl,
                user: req.user.id,
                post: req.params.id
            })
            return res.status(201).json({ post, image });
        }
        res.status(201).json({ post });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;

// create comment
router.post("/:id/comment", async (req, res, next) => {
    try {
        const newComment = await Comment.create({
            content: req.body.comment,
            PostId: req.params.id,
            UserId: req.user.id
        });
        res.status(201).json(newComment);
    } catch (err) {
        console.log(err);
        next(err);
    }
});
// update comment
router.post("/:id/comment/update", async (req, res, next) => {
    try {
        const comment = await Comment.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!comment) {
            return res.status(404).send("no comment exist");
        }
        comment.update({
            content: req.body.comment
        });
        res.status(201).json({ update: true, data: comment });
    } catch (err) {
        console.log(err);
        next(err);
    }
});
// delete comment
router.delete("/:id/comment/delete", async (req, res, next) => {
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
        console.log(err);
        next(err);
    }
});