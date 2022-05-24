const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();

    res.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error);

    next();
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const user = await User.findByPk(id);

    // console.log(user);

    res.status(200).json({
      data: user,
    });
  } catch (error) {
    console.log(error);

    next();
  }
};


