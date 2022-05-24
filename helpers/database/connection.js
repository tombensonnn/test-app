const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// const User = require('../../models/User');

dotenv.config({
    path: "./environment/.env"
});


const sequelize = new Sequelize('appic', 'root', '', {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    password: process.env.PASSWORD
});

const onConnect = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection is successful');
        // User.sync({ force: false });
    } catch (error) {
        console.log('hata', error);
    }
}

// module.exports = onConnect;