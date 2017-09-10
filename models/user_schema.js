const Sequelize = require('sequelize');
const chalk = require('chalk');

const db = new Sequelize('babble', 'chadwindham', '', {
  dialect: 'postgres',
});


const User = db.define('user', {
  user_name: {type: Sequelize.STRING(50), allowNull: false, unique: true,},
  password: {type: Sequelize.STRING, allowNull: false,},
  user_pic: {type: Sequelize.STRING, defaultValue: 'minion_default_user_pic.jpg'}
}, {
  timestamps: false,
});

User.sync().then(function() {
  console.log(chalk.keyword('orange')('User Model, Great Success!'));
});

module.exports = User;


/*
<img src="/public/user_image/{{ user_pic }}">
*/
