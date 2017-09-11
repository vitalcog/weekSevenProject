const express = require('express');
const server = express();
const encrypt = require('bcryptjs');
const chalk = require('chalk');
const parser = require('body-parser');
const stache = require('mustache-express');
const validator = require('express-validator');
const session = require('express-session');
const sequelize = require('sequelize');
const User = require('./models/user_schema');
const Message = require('./models/message_schema');
const Like = require('./models/likes_schema');

//    ---   |||   ---   \\

server.engine('mustache', stache() );
server.set('view engine', 'mustache');
server.set('views', './views');

server.use(express.static('public'));

server.use(parser.urlencoded( {extended: false} ) );

server.use(session({
  secret: 'yes',
  resave: false,
  saveUninitialized: true,
}))

//    ---   |||   ---   \\

// This function checks whether this request is from a valid user. If not it will destroy
// the session.
function checkInvalidate(req) {
  return new Promise(function (success, fail) {
    if (Date.now() - req.session.active > 30000) {
      req.session.regenerate(function (err) {
        if (err) {
          fail(err);
        } else {
          console.log(chalk.bgRed('session timed out! Great Success!'));
          success(); // done!
        }
      }); // end regenerate()
    } else {
      success(); // don't need to destroy, continue on
    }
  });
}


// GET COMMANDS SECTION

// BEGIN MAIN PAGE
server.get('/babble', function(req, res) {
  checkInvalidate(req).then(function () {
      if (req.session.user === undefined) {
        res.redirect('/login');
      }
      else {
        Message.findAll({
          include: [{
            model: User,
          }],
          order: [[ 'createdAt', 'asc']]
        })
        .then(function(blabs) {
          res.render('main', {
            blabs: blabs,
          });
        });
      }
  });
});
// END MAIN PAGE


// BEGIN LIKES PAGE
server.get('/checkYoLikes/:message_id_number', function(req, res) {
  checkInvalidate(req).then(function() {
    Like.findAll( {include: [User], where: {messageId: req.params.message_id_number }})
    .then(function(likedBy) {
      res.render('likes', {
        likedBy: likedBy
        });
      });
  });
  });
// END LIKES PAGE


// BEGIN LOGIN
server.get('/login', function(req, res) {
  checkInvalidate(req);
  res.render('login');
});
// END LOGIN


// END GET COMMANDS SECTION


// ---    |||   ---       |||   ---   |||   ---   |||   ---   \\


// BEGIN POST COMMANDS SECTION

// CREATE A NEW USER
server.post('/register', function(req, res) {
  User.create({
    user_name: req.body.userNameRegister,
    password: encrypt.hashSync(req.body.passwordRegister),
  })
  .then(function() {
    console.log(chalk.red('new user created! Great Success!'));
    res.redirect('/login');
  });
});
// END CREATE A NEW USER


// LOG IN USER, VALIDATE PASSWORD AND CREATE SESSION
server.post('/loggedIn', function(req, res) {
  User.find( {where: {user_name: req.body.userName} } )
  .then(function (user) {
    const correct = encrypt.compareSync(req.body.password, user.password);
    if (correct) {
      req.session.user = user;

      req.session.active = Date.now();

// SETS TIMEOUT FUNCTION TO DESTROY SESSION
      // setInterval(function() {
      //   if (req.session !== undefined) {
      //     if ( (Date.now() - req.session.active) > 60000) {
      //       req.session.destroy();
      //       console.log(chalk.bgRed('session timed out! Great Success!'));
      //     }
      //   }
      // }, 10000);
// END SET TIMEOUT

      res.redirect('/babble');
    }
    else {
      res.redirect('/login');
    }
  });
});

// END LOG IN USER, VALIDATE PASSWORD AND CREATE SESSION


//  CREATE A MESSAGE POST
server.post('/makeBlab', function(req, res) {
  checkInvalidate(req);

  if (req.session.user === undefined) {
    res.redirect('/login');
    return;
  }
  Message.create({
    text_body: req.body.blab,
  })
  .then(function(message) {
    return User.findById(req.session.user.id)
    .then(function(userId) {
      message.setUser(userId);
      req.session.active = Date.now();
      console.log(chalk.keyword('lightsalmon')('new message created! Great Success!'));
      res.redirect('/babble');
    });
  });
});
// END CREATE A MESSAGE POST


// LIKE A POST AND UPDATE LIKE_COUNT IN MESSAGES TABLE
server.post('/likeApost/:idNumber', function(req, res) {
  if (req.session.user === undefined) {
    res.redirect('/login');
    return;
  }
  Like.create()
  .then(function(like) {
    User.findById(req.session.user.id)
    .then(function(userid) {
      like.setUser(userid);
      Message.findById(req.params.idNumber)
      .then(function(message) {
        like.setMessage(message);
        message.update({ like_count: message.like_count + 1}, { where: {id: req.params.idNumber} });
        req.session.active = Date.now();
        console.log(chalk.keyword('salmon')('you liked a message! Great Success!'));
        res.redirect('/babble');
      });
    });
  });
});
// END LIKE A POST AND UPDATE LIKE_COUNT IN MESSAGES TABLE


// DELETE A POST
server.post('/killApost/:id', function(req, res) {
  Message.findById(req.params.id)
  .then(function(message) {
    if (message.userId === req.session.user.id) {
      message.destroy();
      res.redirect('/babble');
    }
    else {
      res.redirect('/babble');
    }
  });
});
// END DELET A POST


// LOG OUT
server.post('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/login');
});
// END LOG OUT


// END POST COMMAND SECTION


// ---    |||   ---   \\
server.listen(3000);
// ---    |||   ---   \\
