var mongoose = require("mongoose");

var ProjectSchema = new mongoose.Schema({
    User: String,
    title: String,
    category: String,
    description: String,
    date: String,
    status: String,
    image: String, // Path to the uploaded image file
    usersEnrolled: [String],
});

module.exports = mongoose.model("Project", ProjectSchema);
