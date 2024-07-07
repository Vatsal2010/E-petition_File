var mongoose = require("mongoose");

var ProjectSchema = new mongoose.Schema({
    User: String,
    title: String,
    category: String,
    description: String,
    date: String,
    urlString: String, 
    status:String,
    image:String,
    usersEnrolled: [String] ,
});

module.exports = mongoose.model("Project", ProjectSchema);