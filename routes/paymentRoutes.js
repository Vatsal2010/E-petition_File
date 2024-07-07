const express = require('express');
const router = express.Router();
const Razorpay = require("razorpay");
const User = require("../models/user");
const middleware = require('../middleware/middleware');
require('dotenv').config()
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

 

 
 
module.exports = router;