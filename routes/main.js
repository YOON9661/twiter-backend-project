const express = require("express");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        res.status(201).send("hello world");
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;