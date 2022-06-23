const User = require("../models/User");
const bcrypt = require("bcrypt");
const { sendJwtToClient } = require("../helpers/tokenHelpers");
const { Op } = require('sequelize');
const {
  validateUserInput,
  comparePassword,
} = require("../helpers/auth/input/inputHelpers");
const CustomError = require("../helpers/error/CustomError");
const sendEmail = require("../helpers/libraries/sendEmail");

exports.createUser = async (req, res, next) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const age = req.body.age;
    const password = req.body.password;
    const email = req.body.email;

    // const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      age: age,
      password: password,
      email: email,
    });

    sendJwtToClient(user, res);

    res.status(200).json({
      message: "User created successfuly",
    });
  } catch (error) {
    console.log(error);

    next();
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // console.log(email);
    if (!validateUserInput(email, password)) {
      return next(new CustomError("Please check your inputs", 400));
    }

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    // console.log(user);

    if (!user || !comparePassword(password, user.password)) {
      return next(new CustomError("Please check your credentials", 400));
    }

    await sendJwtToClient(user, res);

    res.status(200).json({
      success: true,
      user: user.firstName + " " + user.lastName,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.logout = async (req, res, next) => {
  const { JWT_COOKIE_EXPIRE, NODE_ENV } = process.env;

  return res
    .status(200)
    .cookie("access_token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message: "Logout Successfull",
    });
};

exports.getUserLoggedIn = async (req, res, next) => {
  res.json({
    status: true,
    user: req.user,
  });
};

exports.forgotPassword = async (req, res, next) => {
  
    const resetEmail = req.body;

    let user = await User.findOne({
      where: resetEmail
    });

    if (!user) {
      return next(new CustomError("There is no user with that email", 400));
    }

    const resetPasswordToken = user.getResetPasswordToken();

     user = await user.save();

    const resetPasswordUrl = `http://localhost:3000/api/auth/resetPassword?resetPasswordToken=${resetPasswordToken}`;

    const emailTemplate = `
      <h3>Reset your password</h3>
      <p> This <a href = '${resetPasswordUrl}' target = '_blank'>link</a> will expire in 1 hour </p>
    `;
    try {

    await sendEmail({
      from: process.env.SMTP_USER,
      to: resetEmail,
      subject: "Reset your password",
      html: emailTemplate,
    });

    res.json({
      success: true,
      message: "Token sent to your email",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    user.save();

    console.log(error.code);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { resetPasswordToken } = req.query;

    const {password} = req.body;

    if (!resetPasswordToken) {
      return next(new CustomError("Please provide a valid token", 400));
    }

    let user = await User.findOne({
      where: {
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { [Op.lte]: Date.now() }
      },
    });

    console.log(user);

    if (!user) {
      return next(new CustomError("Invalid Token or Session Expired",404));
  }

    
    // await user.update(
    //   {
    //     where: {
    //       password: password
    //     }
    //   }  
    // );

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    
    await user.save();

    sendJwtToClient(user, res);

    res.status(200).json({
      success: true,
      message: "Reset password operation successful",
    });
  } catch (error) {
    console.log(error);
  }
};
