const { ESRCH } = require("constants");
const express = require("express");
const multer = require("multer");
const path = require("path");

const { Post, User, Comment, Image } = require("../models");

const { isLoggedIn } = require("./middleware");

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
                include: [{
                    model: User,
                    attributes: ["id", "nickname"]
                }, {
                    model: User,
                    through: "CommentLike",
                    as: "CommentLikers",
                    attributes: ["id", "nickname"]
                }]
            }, {
                model: Post,
                as: "Retweet",
                include: [{
                    model: User,
                    attributes: ["id", "nickname"]
                }, {
                    model: Image
                }],
            }, {
                model: User,
                through: "Retweet",
                as: "Retweeters"
            }, {
                model: Image
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
        // image가 있을 때..
        if (req.body.imagepath) {
            const image = await Image.create({
                Imagepath: req.body.imagepath,
                UserId: req.user.id,
            });
            post.addImages(image);
            return res.status(201).json({ post, image });
        }
        res.status(201).json({ post });
    } catch (err) {
        console.error(err);
        next(err);
    }
});
// post delete
router.delete("/:id/delete", isLoggedIn, async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!post) {
            return res.status(404).send("포스트 없다 이새키야");
        }
        post.destroy();
        res.status(201).json({
            postId: req.params.id
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
})




// LIKE
router.post("/:id/like", async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!post) {
            return res.status(404).send("no post exist");
        }
        const myData = await User.findOne({
            where: {
                id: req.user.id
            }
        })
        await post.addPostLikers(req.user.id);
        res.status(201).json({
            id: req.user.id,
            nickname: myData.nickname,
            PostId: req.params.id
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});
router.delete("/:id/likedelete", async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!post) {
            return res.status(404).send("no post exist");
        }
        const myData = await User.findOne({
            where: {
                id: req.user.id
            }
        })
        await post.removePostLikers(req.user.id);
        res.status(201).json({
            id: myData.id,
            nickname: myData.nickname,
            PostId: req.params.id
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

// comment like
router.post("/:postId/comment/:commentId/like", isLoggedIn, async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.postId
            }
        });
        if (!post) {
            return res.status(404).send("포스트 없어용");
        }
        const comment = await Comment.findOne({
            where: {
                id: req.params.commentId
            }
        });
        if (!comment) {
            return res.status(404).send("no comment exist");
        }
        comment.addCommentLikers(req.user.id);
        res.status(201).json({
            id: req.user.id,
            postId: req.params.postId,
            commentId: req.params.commentId,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});
router.delete("/:postId/comment/:commentId/like/delete", isLoggedIn, async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.postId
            }
        });
        if (!post) {
            return res.status(404).send("포스트 없어용");
        }
        const comment = await Comment.findOne({
            where: {
                id: req.params.commentId
            }
        });
        if (!comment) {
            return res.status(404).send("no comment exist");
        }
        comment.removeCommentLikers(req.user.id);
        res.status(201).json({
            id: req.user.id,
            postId: req.params.postId,
            commentId: req.params.commentId,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// create comment
router.post("/:id/comment", isLoggedIn, async (req, res, next) => {
    try {
        const newComment = await Comment.create({
            content: req.body.comment,
            PostId: req.params.id,
            UserId: req.user.id
        });
        const me = await User.findOne({
            where: {
                id: req.user.id
            }
        });
        res.status(201).json({
            id: newComment.id,
            content: newComment.content,
            UserId: me.id,
            PostId: req.params.id,
            User: {
                id: me.id,
                nickname: me.nickname
            },
            CommentLikers: []
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});
// update comment
router.post("/:postId/comment/:commentId/update", isLoggedIn, async (req, res, next) => {
    try {
        const comment = await Comment.findOne({
            where: {
                id: req.params.commentId
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
router.delete("/:postId/comment/:commentId/delete", isLoggedIn, async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.postId
            }
        });
        if (!post) {
            return res.status(404).send("포스트 없다 개세이야")
        }
        const comment = await Comment.findOne({
            where: {
                id: req.params.commentId
            }
        });
        if (!comment) {
            return res.status(404).send("no comment exist");
        }
        await comment.destroy();
        res.status(201).json({
            postId: req.params.postId,
            commentId: req.params.commentId
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports = router;