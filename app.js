const express = require("express");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const passport = require("passport");

const db = require("./models");
const passportConfig = require("./passport");

dotenv.config();
// router
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const retweetRouter = require("./routes/retweet");


const app = express();
passportConfig();

db.sequelize.sync({ force: true })
    .then(() => {
        console.log("db 연결 성공")
    })
    .catch((err) => {
        console.log(err);
    });

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(morgan("dev")); //dev mode
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // req.body
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/retweet", retweetRouter);


// error router
app.use((req, res, next) => {
    res.status(404).send("cannot found...");
})

app.use((err, req, res, next) => {
    res.status(500).send("server error...");
})

app.listen(3001, () => {
    console.log("3001번 포트 실행 중...");
});