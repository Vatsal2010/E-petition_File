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
 
// Define the schema and model for signed PDFs
const signedPdfSchema = new mongoose.Schema({
  filename: String,
  data: Buffer,
  contentType: String,
});

const SignedPdf = mongoose.model('SignedPdf', signedPdfSchema);

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to render the home page with download and upload options
// Route to render the upload page
app.get('/upload/:id', (req, res) => {
  let id = req.params.id;
  res.render('upload',{id});
});

// Route to handle PDF download
app.get('/download-pdf', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'EPetitionFile.pdf');
  res.download(filePath);
});

// Route to handle PDF upload and trigger enrollment
app.post('/upload-pdf', upload.single('signedPdf'), async (req, res) => {
  // console.log(req.body);
  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const fileData = fs.readFileSync(filePath);

    const newPdf = new SignedPdf({
      filename: req.file.originalname,
      data: fileData,
      contentType: 'application/pdf',
    });

    await newPdf.save(); // Save the uploaded PDF to the database

    // Get the most recently uploaded PDF
    const pdf = await SignedPdf.findOne().sort({ _id: -1 }).exec();

    if (!pdf) {
      return res.status(404).send('No signed PDF found');
    }

    // After successful upload and save, trigger the enrollment process
    const projectId = req.body.userId; // Assuming projectId is passed in the request body
    console.log(projectId);
    const enrollResponse = await fetch('https://bharatkenagrik.com/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectId })
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
    res.status(500).send('Error occurred during the process');
  }
});

// Route to display the uploaded PDF
// app.get('/display', async (req, res) => {
//   try {
//     const pdf = await SignedPdf.findOne().sort({ _id: -1 }).exec(); // Get the most recent PDF

//     if (!pdf) {
//       return res.status(404).send('No signed PDF found');
//     }

//     res.render('display', { pdf });
//   } catch (error) {
//     console.error('Error fetching PDF:', error);
//     res.status(500).send('Error fetching PDF');
//   }
// });

 

app.listen(PORT, function () {
  console.log(`Server Started at port ${PORT}`);
});



