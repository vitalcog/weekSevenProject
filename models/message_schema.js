const Sequelize = require('sequelize');
const chalk = require('chalk');
const User = require('./user_schema');

const db = new Sequelize('babble', 'chadwindham', '', {
  dialect: 'postgres',
});


const Message = db.define('message', {
  text_body: Sequelize.STRING(510),
  like_count: Sequelize.INTEGER,
});

Message.belongsTo(User);

Message.sync().then(function() {
  console.log(chalk.keyword('orange')('Message Model, Great Success!'));
});

module.exports = Message;
