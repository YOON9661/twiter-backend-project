const express = require("express");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const passport = require("passport");
const helmet = require("helmet");
const hpp = require("hpp");
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

// const csrf = require('csurf');

const db = require("./models");
const passportConfig = require("./passport");

dotenv.config();
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD
});
// router
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const retweetRouter = require("./routes/retweet");
const commentRouter = require("./routes/comment");

const app = express();
passportConfig();

db.sequelize.sync({ force: false })
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

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
    app.use(helmet());
    app.use(hpp());
} else {
    app.use(morgan('dev'));
}

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
    },
    store: new RedisStore({ client: redisClient })
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/retweet", retweetRouter);
app.use("/comment", commentRouter);


// error router
app.use((req, res, next) => {
    res.status(404).send("cannot found...");
})

app.use((err, req, res, next) => {
    res.status(500).send("서버 에러 개세이야...");
})

app.listen(3001, () => {
    console.log("3001번 포트 실행 중...");
});