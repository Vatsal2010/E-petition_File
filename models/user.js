var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  customerId: String,
  firstName: String,
  lastName: String,
  email: String,
  username: String,
  password: String, 
  subscriptionStatus: String,
  paymentId: String,
  PhotoID: String,
  formFilled:{ type: String, default: "notFilled" },
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  ],
});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
