

exports.unixToDate = (unix) => {
    let unixMilliSeconds = unix * 1000;
    let dateObject = new Date(unixMilliSeconds)
    let humanDateFormat = dateObject.toLocaleDateString()
    return humanDateFormat;
}


exports.isUserExist = (userName, userEmail) => {
    User.find({ $or: [{ username: userName }, { email: userEmail }] }, (err, foundUsers) => {
        if (foundUsers.length != 0)
            return true;
        return false;
    }
    );
}


exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/user/login");
}


 
exports.todaysDate = () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    today = dd + "/" + mm + "/" + yyyy;
    return today;
}