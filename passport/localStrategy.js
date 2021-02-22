const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { User } = require("../models");

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: "email",   //req.body.eamil
        passwordField: "password" // req.body.password
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({
                where: {
                    email: email
                }
            });
            if (user) {
                const result = await bcrypt.compare(password, user.password);
                if (result) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "비밀번호가 일치하지 않습니다." });
                }
            } else {
                return done(null, false, { message: "가입되지 않은 회원입니다." });
            }
        } catch (err) {
            console.error(err);
            done(err);
        }
    }));
};