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

    const {email, password} = req.body;

    if (!validateUserInput(email, password)){
      return next(new CustomError("Please check your inputs", 400));
    }

    const user = await User.findOne({email});

    console.log(user.password);

    if (!comparePassword(password, user.password)){
      return next(new CustomError("Please check your credentials", 400));
    }

    await sendJwtToClient(user, res);

  } catch (error) {
    console.log(error);
  }
};

exports.getUser = (req, res, next) => {
  res.json({
    success: true,
    message: {
      id: req.user.id,
      name: req.user.name,
    },
  });
};
