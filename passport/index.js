const { User } = require("../models");
const local = require("./localStrategy");
const passport = require("passport");

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id); // 사용자 아이디만 저장
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findOne({
                where: { id },
                include: [{
                    model: User,
                    as: "Followers",
                    attributes: ["id", "nickname"]
                }, {
                    model: User,
                    as: "Followings",
                    attributes: ["id", "nickname"]
                }]
            })
            done(null, user);
        } catch (err) {
            console.error(err);
            done(error);
        }
    });

    local();
}