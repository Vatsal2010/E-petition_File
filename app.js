const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const User = require("./models/user"); 
const cors = require("cors");
const Razorpay = require("razorpay"); 
const path = require('path');
const indexRouter = require('./routes/indexRoutes');
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const multer = require('multer'); 
const fs = require('fs');
const user = require("./models/user");
// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const path = require('path');
const fetch = require('node-fetch');
// const fs = require('fs');
require('dotenv').config()
 
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_CONN_STRING, (err) => {
  if (err) console.log(err);
  else console.log("connected");
}
);
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(cookieParser("secret"));
//PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "Monkey singh is best graphic designer",
  resave: false,
  saveUninitialized: false,
})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/payment', paymentRouter);

app.use(express.static(path.join(__dirname, 'public')));
  
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
 
const signedPdfSchema = new mongoose.Schema({
  filename: String,
  url: String, // Storing Cloudinary URL
  contentType: String,
});

const SignedPdf = mongoose.model('SignedPdf', signedPdfSchema);

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pdf_uploads',  // Specify the folder to store the PDFs
    resource_type: 'raw',   // 'raw' because PDFs are non-image files
    format: async () => 'pdf',  // Ensure the format is PDF
  },
});
 
const upload = multer({ storage: storage });
 
app.get('/upload/:id', (req, res) => {
  let id = req.params.id;
  res.render('upload', { id });
});

// Route to handle PDF download from local file (if necessary)
app.get('/download-pdf', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'EPetitionFile.pdf');
  res.download(filePath);
});

// Route to handle PDF upload and trigger enrollment process
app.post('/upload-pdf', upload.single('signedPdf'), async (req, res) => {
  try {
    // req.file will contain information about the uploaded PDF on Cloudinary
    const uploadedPdfUrl = req.file.path; // Cloudinary URL for the uploaded PDF

    // Save the Cloudinary URL and other details to the database
    const newPdf = new SignedPdf({
      filename: req.file.originalname,
      url: uploadedPdfUrl,  // Store Cloudinary URL
      contentType: req.file.mimetype,
    });

    await newPdf.save(); // Save the PDF information in MongoDB

    // Fetch the most recent PDF from the database (if needed)
    const pdf = await SignedPdf.findOne().sort({ _id: -1 }).exec();

    if (!pdf) {
      return res.status(404).send('No signed PDF found');
    }

    // After successful upload and save, trigger the enrollment process
    const projectId = req.body.userId; // Assuming projectId is passed in the request body
    console.log(projectId);

    const enrollResponse = await fetch('http://localhost:3000/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId }),
    });

    if (enrollResponse.ok) {
      // Render the display page with the uploaded PDF after successful enrollment
      res.render('display', { pdf });
    } else {
      // Handle enrollment failure
      res.status(500).send('Enrollment failed');
    }
  } catch (error) {
    console.error('Error saving file or enrolling:', error);
    res.status(500).send('Error occurred during the process',error);
  }
});

 

app.listen(PORT, function () {
  console.log(`Server Started at port ${PORT}`);
});



