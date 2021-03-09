const express = require("express");
const bcrypt = require('bcrypt');
const passport = require("passport");

const { User, Post, Comment, Image } = require("../models");

const { isLoggedIn, isNotLoggedIn } = require("./middleware");

const router = express.Router();


router.post("/register", isNotLoggedIn, async (req, res, next) => {
    try {
        const exUser = await User.findOne({
            where: {
                email: req.body.email
            }
        });
        if (exUser) {
            return res.status(403).send("이미 존재하는 유저가 있습니다.");
        }
        const hashPassword = await bcrypt.hash(req.body.password, 13);
        const newUser = await User.create({
            email: req.body.email,
            nickname: req.body.nickname,
            password: hashPassword
        });
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//login
router.post("/login", isNotLoggedIn, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        if (info) {
            return res.status(403).send(info.message);
        }
        return req.login(user, async (loginError) => {
            if (loginError) {
                console.error(loginError)
                return next(loginError);
            }
            // res.setHeader("cookie", "sjfaijf");
            res.status(201).json(user);
        })
    })(req, res, next);
});

// LOGOUT
router.post("/logout", isLoggedIn, (req, res, next) => {
    req.logOut;
    req.session.destroy();
    res.status(201).send("logout success!");
});

router.get("/:id", async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: Post,
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
                }]
            }, {
                model: User,
                through: "Follow",
                as: "Followers"
            }, {
                model: User,
                through: "Follow",
                as: "Followings"
            }]
        });
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// following 
router.post("/:id/following", isLoggedIn, async (req, res, next) => {
    try {
        const me = await User.findOne({
            where: {
                id: req.user.id
            }
        });
        const user = await User.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!user) {
            res.status(404).send("해당 유저는 존재하지 않습니다...");
        }
        await me.addFollowings(req.params.id);
        res.status(201).json({ id: parseInt(req.user.id) });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post("/:id/unfollowing", isLoggedIn, async (req, res, next) => {
    try {
        const me = await User.findOne({
            where: {
                id: req.user.id
            }
        });
        const user = await User.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!user) {
            res.status(404).send("해당 유저는 존재하지 않습니다...");
        }
        await me.removeFollowings(req.params.id);
        res.status(201).json({ id: parseInt(req.user.id) });
    } catch (err) {
        console.error(err);
        next(err);
    }
});


module.exports = router;