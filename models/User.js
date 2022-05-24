const { Sequelize, DataTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

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
    unique: true
  },
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

module.exports = User;
