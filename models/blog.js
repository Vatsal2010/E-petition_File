var mongoose = require("mongoose");

var BlogSchema = new mongoose.Schema({
  category:String,
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  ]
});

module.exports = mongoose.model("Blog", BlogSchema);
