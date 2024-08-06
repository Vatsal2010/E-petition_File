const express = require('express');
const router = express.Router();
const axios = require('axios');
const Razorpay = require("razorpay");
const crypto = require('crypto'); 
const User = require("../models/user");
const Work = require("../models/work");
const Blog = require("../models/blog");
const Project = require("../models/project");
const Testimonial = require("../models/testimonial");
const ContactQuery = require("../models/contactQuery");
const middleware = require('../middleware/middleware'); 
require('dotenv').config();
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET,
});


// '/'
router.get("/", async (req, res) => {
    let workArray = await Work.find({});
    let testimonialArray = await Testimonial.find({});
    // middleware.shuffle(workArray);
    res.render("home",  { workArray, testimonialArray, user: req.user });
});

router.get("/login", (req, res) => {
    res.render("login");
});
router.get("/dashboard", middleware.isLoggedIn, async function (req, res) {
    // populating its posts and rendering dashboard
    let user = await User.findOne({ email: req.user.email })
    // user.subscriptionStatus="notActive";
    // console.log(user.subscriptionStatus);
    if (user.subscriptionStatus!=="active") {

        res.render("index")
    }
    else {
         
            User.findOne({ email: req.user.email }).populate("projects").exec(function (err, user) {
                if (err) console.log(err);
                else {
                    res.render("dashboard", { user });
                }
            });
       
    }
});


router.get("/contact-us", (req, res) => {
    res.render("contactus", { isQuerySubmitted: false, user: req.user });
});


router.post("/contact-us", (req, res) => {
    let { name, email, phoneNumber, companyName, message } = req.body;
    ContactQuery.create({ name, email, phoneNumber, companyName, message }, (err, contactQuery) => {
        if (err) console.log(err);
        else res.render("contactus", { isQuerySubmitted: true });
    }
    );
});

router.get("/buySubscription",(req,res)=>{
res.render('index');
});

router.get("/our-work", (req, res) => {
    res.redirect("/our-work/All");
});


router.get("/our-work/:category", (req, res) => {
    var category = req.params.category;
    if (category == "All") {
        Work.find({}, (err, workArray) => {
            if (err) console.log(err);
            else {
                res.render("ourwork", { workArray: workArray, category: "all" });
            }
        });
    } else {
        Work.find({ category: category }, (err, workArray) => {
            if (err) console.log(err);
            else {
                res.render("ourwork", { workArray: workArray, category: category });
            }
        });
    }
});


router.get("/blog", async(req, res) => {
    const blogs = await Blog.find().populate('projects').exec();
    res.render('blog', { blogs: blogs, user: req.user });
});


router.get('/blog/filter', async (req, res) => {
    const { category, user, title } = req.query;
   
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
  
    if (user) {
      filter['projects.User'] = user;
    }
  
    if (title) {
      filter['projects.title'] = { $regex: title, $options: 'i' }; 
    }
  
    try {
      const filteredBlogs = await Blog.find(filter).populate('projects').exec();
      console.log(filteredBlogs);
      res.render('blog', { blogs: filteredBlogs });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  });
 
  router.post('/enroll', function(req, res) {
    const projectId = req.body.projectId;
    const username = req.user.username;  
    Project.findByIdAndUpdate(projectId, { $push: { usersEnrolled: username } }, function(err, project) {
        if (err) {
            console.log(err);
            res.status(500).send("Error enrolling user");
        } else {
            res.status(200).send("Enrolled successfully");
        }
    });
});

// Route to render project creation form
router.get('/create-project', (req, res) => {
    res.render('createProject');
});
router.get("/aadhaar",(req,res)=>{
    res.render("aadhaar");
    });
    

router.post('/request-otp', (req, res) => {
        const aadhaar = req.body.aadhaar;
    
        let data = JSON.stringify({
            "uid": aadhaar
        });
    
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url:  "https://api.signzy.app/api/v3/aadhaar/basicVerify",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.AADHAAR_API_KEY
            },
            data: data
        };
    
        axios.request(config)
        .then((response) => {
            console.log(response);
            if (response.status === 200 && response.data.result.verified === true) {
                res.render('aadhaarSuccess');  // assuming 'login.ejs' is in your views folder
            } else {
                res.render('alert');
            }
        })
        .catch((error) => {
            console.error(error);
            res.render('alert');
        });
    });
   
    
router.post("/create-project", middleware.isLoggedIn, function (req, res) {
    // get data from form and add to projectList array
    User.findOne({ email: req.user.email }, (err, user) => {
        if (user.subscriptionStatus == "active") {
            Project.create(
                {
                    User: req.user.username,
                    title: req.body.title,
                    category: req.body.category,
                    description: req.body.description,
                    date: middleware.todaysDate(),
                    urlString:req.body.url,
                    status:"pending",
                    image:req.body.photoUrl,

                },
                function (err, project) {
                    User.findOne({ email: req.user.email }, function (err, foundUser) {
                        if (err) console.log(err);
                        else {
                            foundUser.projects.push(project);
                            foundUser.save(function (err, data) {
                                if (err) console.log(err);
                            });
                        }
                    });
                }
            );
            Project.create(
                {
                    User: req.user.username,
                    title: req.body.title,
                    category: req.body.category,
                    description: req.body.description,
                    date: middleware.todaysDate(),
                    urlString:req.body.url,
                    status:"pending",
                    image:req.body.photoUrl,
                },
                function (err,project) {
                    Blog.findOne({ category: req.body.category }, function (err, foundCategory) {
                        if (err) console.log(err);
                        else {
                            foundCategory.projects.push(project);
                            foundCategory.save(function (err, data) {
                                if (err) console.log(err);
                            });
                        }
                    });
                },
            );
             
            res.redirect("/dashboard");
        }
        else {
            res.redirect("/buySubscription");
        }
    })
});

  router.post('/projects/:id/verify', async (req, res) => {
    try {
      const projectId = req.params.id;
      const updatedProject = await Project.findByIdAndUpdate(projectId, { status: 'verified' }, { new: true });
      if (!updatedProject) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      res.json({ success: true, project: updatedProject });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
 
router.get('/index', (req, res) => {
    res.render('index');
});

// Create order
router.post('/order', async (req, res) => {
    const options = {
        amount: 20000,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        // res.status(500).send(error);
    }
});


 
  
router.get("/successPay", middleware.isLoggedIn, async function (req, res) {
    try {
        const { order_id, payment_id, gmail } = req.query;
        console.log(order_id);
        console.log(payment_id);
        console.log(gmail);

        let user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        console.log(user.subscriptionStatus);
        user.subscriptionStatus = "active";
        await user.save();
        console.log(user.subscriptionStatus);
        res.render('successPay', { order_id, payment_id });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Verify payment
router.post('/verify', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
   
    if (digest === razorpay_signature) {
        res.status(200).json({ success: true, order_id: razorpay_order_id, payment_id: razorpay_payment_id}); 
    } else {
        res.status(400).send('Invalid signature');
    }
});

router.get('/display', async (req, res) => {
  try {
    const pdf = await SignedPdf.findOne().sort({ _id: -1 }).exec(); // Get the most recent PDF

    if (!pdf) {
      return res.status(404).send('No signed PDF found');
    }

    res.render('display', { pdf });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).send('Error fetching PDF');
  }
});

module.exports = router;