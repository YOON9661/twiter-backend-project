const express = require("express");
const multer = require("multer");
const path = require("path");

const { Post, User, Comment } = require("../models");

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
                as: "PostLiker",
                attributes: ["id", "nickname"]
            }, {
                model: Comment,
                attributes: ["id"],
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
            image: req.body.url,
            UserId: req.user.id
        });
        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;