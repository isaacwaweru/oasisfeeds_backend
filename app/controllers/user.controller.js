const User = require("../models/user.model.js");
const sendEmail = require("../util/email.js");
const crypto = require("crypto");
const jwt = require("../util/jwt.js");
const AppError = require("../util/AppError.js");
const catchAsync = require("../util/catchAsync.js");
const bcrypt = require("bcrypt");

//login user
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      return res.status(400).json({
        status: "invalid!",
        message: "User not found!",
      });
    }
    if (user.stSGNatus === false) {
      return res.status(400).json({
        status: "invalid!",
        message: "Email sent please activate your account!",
      });
    }
    bcrypt
      .compare(req.body.password, user.password)
      .then((valid) => {
        if (!valid) {
          return res.status(400).json({
            status: "invalid!",
            message: "Incorrect details!",
          });
        }
        const token = jwt.sign({ userId: user._id });
        res.status(200).json({
          user: user,
          token: token,
        });
      })
      .catch((error) => {
        res.status(400).json({
          error,
        });
      });
  });
};

//Sign up user
exports.signup = (req, res, next) => { 
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone: req.body.phone,
      password: hash,
      role: req.body.role,
      status: req.body.status,
      location: req.body.location,
      apps: req.body.apps
    });
    user
      .save()
      .then(() => {
        res.status(200).json({
          status: "success",
          message: user,
        });
      })
      .catch((error) => { 
        console.log(error)
        res.status(400).json({
          status: "invalid!",
          message: "Registration failed!",
        });
      });
  });
};

//Account activation
exports.accountActivation = (req, res) => {
  // console.log(req.body);
  try {
    // The base64 encoded input string
    const emailDecode = req.body.token;
    // Create a buffer from the string
    const bufferObj = Buffer.from(emailDecode, "base64");
    // Encode the Buffer as a utf8 string
    const emailDecoded = bufferObj.toString("utf8");
    User.findOneAndUpdate(
      { email: emailDecoded },
      { $set: { status: true } },
      { new: true, useFindAndModify: false },
      (error, doc) => {
        if(doc){
          res.status(200).json({
            status: "success",
            message: "Account activated!",
          });
        }else{
          res.status(400).json({
            status: "invalid",
            message: "Activation Failed",
          });
        }
      }
    );
  } catch (error) {
    res.status(400).json({
      status: "invalid",
      message: "Activation Failed",
    });
  }
};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single user with a userId
exports.findOne = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId,
        });
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId,
        });
      }
      return res.status(500).send({
        message: "Error retrieving user with id " + req.params.userId,
      });
    });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTED email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).json({
      status: "invalid",
      message: "There is no user with email address.",
    });
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL =
    process.env.FRONTEND_URL + "/resetPassword?token=" + resetToken;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:
   ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(err), 500);
  }
});

//reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    res.status(400).json({
      status: "invalid",
      message: "This token is invalid or has expired!!",
    });
  } else {
    bcrypt.hash(req.body.password, 10).then((hash) => {
      user.password = hash;
      user.passwordResetToken = req.body.token;
      user.passwordResetExpires = undefined;
      user.save();
      // 3) Update changedPasswordAt property for the user
      res.status(200).json({
        status: "success",
        message: "Password successfully changed!",
      });
    });
  }
});

// Find a single app with a appId
exports.findOneApp = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "App not found with id " + req.params.appId,
        });
      }
      const apps = user.apps;
      const app = apps.filter(function (el) {
            return el.api_key === req.params.appId;
        })
      res.send(app[0]);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "App not found with id " + req.params.appId,
        });
      }
      return res.status(500).send({
        message: "Error retrieving app with id " + req.params.appId,
      });
    });
};

//User add app
exports.addApp = async (req, res) => {
  const user = await User.findOne({_id: req.params.userId});
  user.apps.push(req.body)
  const response = await user.save().then(() => {
      res.status(200).json({
          message: "App requested successfully!",
      });
  })
      .catch((error) => {
          res.status(500).json({
              error: error,
          });
      });
}