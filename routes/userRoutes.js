const express = require('express');
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const middleware = require('../middleware/middleware');

// '/user'
router.get("/register", function (req, res) {
    res.render("register", { err: "" });
});

router.get("/login", function (req, res) {
    res.render("login");
});

router.get("/login_err", (req, res) => {
    res.render("login_err");
});

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

router.get("/forgotpassword", (req, res) => {
    res.render("forgotpassword", { err: "" });
});

router.get("/loginSuccess",(req,res)=>{
    res.render("loginSuccess")
})

router.get("/forgotusername", (req, res) => {
    res.render("forgotusername");
});

 

router.post("/register", function (req, res) {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
    });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register", { err: err.message });
        }
        res.render("aadhaar");
    });
});
// Route to render Aadhaar input page
 

router.post("/login", passport.authenticate("local", {
    successRedirect: "/user/loginSuccess",
    failureRedirect: "/user/login_err",
}));

router.post("/sendusernameforgotusername", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err || !user) {
            return res.redirect("/");
        }
        res.render("forgotusername", { username: user.username });
    });
});

module.exports = router;
