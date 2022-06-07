const User = require("../models/User");
const bcrypt = require("bcrypt");
const { sendJwtToClient } = require("../helpers/tokenHelpers");
const { validateUserInput, comparePassword } = require("../helpers/auth/input/inputHelpers");
const CustomError = require("../helpers/error/CustomError");

exports.createUser = async (req, res, next) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const age = req.body.age;
    const password = req.body.password;
    const email = req.body.email;

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      age: age,
      password: encryptedPassword,
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
    if (!validateUserInput(email, password)){
      return next(new CustomError("Please check your inputs", 400));
    }

    const user = await User.findOne({where: {
      email: email
    }});

    // console.log(user);

    if (!user || !comparePassword(password, user.password)){
      return next(new CustomError("Please check your credentials", 400));
    }

    await sendJwtToClient(user, res);

    res.status(200).json({
      success: true,
      user: user.firstName + " " + user.lastName
    });

  } catch (error) {
    console.log(error);
  }
};

exports.logout = async(req, res, next) => {
  
  const {JWT_COOKIE_EXPIRE, NODE_ENV} = process.env;

  return res
    .status(200)
    .cookie("access_token",null, {
        httpOnly : true,
        expires : new Date(Date.now()),
        secure : NODE_ENV === "development" ? false : true
    })
    .json({
        success : true,
        message : "Logout Successfull"
    });
}

exports.getUserLoggedIn = async(req, res, next) => {

  res
  .json({
    status: true,
    user: req.user
  }); 

}
