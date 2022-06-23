const { Sequelize, DataTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const dotenv = require("dotenv");

dotenv.config({
  path: "./environment/.env",
});

const sequelize = new Sequelize("appic", "root", "", {
  host: process.env.HOST,
  dialect: process.env.DIALECT,
  password: process.env.PASSWORD,
  define: {
    timestamps: false,
  },
});

const User = sequelize.define("User", {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
  }
});

User.prototype.generateJwtFromUser = function () {
  const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;

  const payload = {
    id: this.id,
    name: this.firstName,
  };

  const token = jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRE,
  });

  return token;
};

User.prototype.getResetPasswordToken = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex");



  // console.log(randomHexString);

  const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");

    console.log(resetPasswordToken);

  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = Date.now() + parseInt(process.env.RESET_PASSWORD_EXPIRE);

  return resetPasswordToken;
};

// User.beforeCreate(function () {
//   bcrypt.genSalt(10, (salt) => {
//     // if (err) next(err);
//     bcrypt.hash(this.password, salt, (hash) => {
//         // if (err) next(err);
//         this.password = hash;
//         // next();
//     });
// });
// });

User.beforeSave((user) =>  {

  // if(!user.changed("password")){
    
  // }

  if (user) {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(user.getDataValue('password'), salt);

   // user.password = hash; Not working
    user.setDataValue('password', hash); // use this instead
  }
})

module.exports = User;
