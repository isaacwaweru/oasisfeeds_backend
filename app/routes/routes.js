module.exports = (app) => {
    const auth = require("../middleware/auth.js");
    const users = require("../controllers/user.controller.js");
    const sms = require("../controllers/sms.controller.js");

    // User sign up
    app.post("/register", users.signup);
  
    //User account activation
    app.put("/activate", users.accountActivation);
  
    // user login
    app.post("/login", users.login);
  
    // Retrieve all users
    app.get("/users", auth, users.findAll);
  
    // Retrieve a single user with usersId
    app.get("/users/:userId", auth, users.findOne);
  
    // User forgot password
    app.post("/forgotPassword", users.forgotPassword);
  
    //User reset password
    app.patch("/resetPassword", users.resetPassword);

    //Send SMS to single
    app.post("/send/single", sms.sendSingle);

    //Send SMS to CSV
    app.post("/send/csv", sms.sendCSV);
  
  };
  