const express = require("express");

const { Comment } = require("../models");

const { isLoggedIn } = require("./middleware");

const router = express.Router();





module.exports = router;