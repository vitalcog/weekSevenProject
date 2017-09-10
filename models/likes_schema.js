const Sequelize = require('sequelize');
const chalk = require('chalk');
const User = require('./user_schema');
const Message = require('./message_schema');

const db = new Sequelize('babble', 'chadwindham', '', {
  dialect: 'postgres',
});


const Like = db.define('like', {}, {timestamps: false,});

Like.belongsTo(User);
Like.belongsTo(Message);

Like.sync().then(function() {
  console.log(chalk.keyword('orange')('Like Model, Great Success!'));
});

module.exports = Like;
