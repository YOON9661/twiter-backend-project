const express = require("express");
const bcrypt = require('bcrypt');
const passport = require("passport");

const { User, Video, Post } = require("../models");

const router = express.Router();



router.post("/register", async (req, res, next) => {
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
router.post("/login", (req, res, next) => {
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
router.post("/logout", (req, res, next) => {
    req.logOut();
    req.session.destroy();
    res.status(201).send("logout success!");
});

router.get("/:id", async (req, res, next) => {
    try {
        const user = await User.findOne({
            order: [["createdAt", "DESC"]],
            where: {
                id: req.params.id
            },
            include: [{
                model: Video,
            }, {
                model: Post,
                order: [["createdAt", "DESC"]]
            }, {
                model: Video,
                through: "VideoLike",
                as: "VideoLikings",
                order: [["createdAt", "DESC"]],
            }, {
                model: User,
                through: "Subscribe",
                as: "Subscribings",
                order: [["createdAt", "DESC"]]
            }, {
                model: User,
                through: "Subscribe",
                as: "Subscribers",
                order: [["createdAt", "DESC"]]
            }]
        });
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post("/:id/subscribing", async (req, res, next) => {
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
        await me.addSubscribings(user);
        res.status(201).json({ subscribe: true, SubscribedId: user, SubscribingId: me });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post("/:id/unSubscribing", async (req, res, next) => {
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
        await me.removeSubscribings(user);
        res.status(201).json({ unSubscribe: true, UnSubscribedId: user, UnSubscribingId: me });
    } catch (err) {
        console.error(err);
        next(err);
    }
});


module.exports = router;