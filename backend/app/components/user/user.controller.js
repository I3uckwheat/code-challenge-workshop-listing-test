const winston = require('winston');
const validator = require('validator');

const passport = require('passport');

const userService = require('./user.service');
const workshopService = require('../workshop/workshop.service');

exports.signUpHandler = async (req, resp) => {
  let userObj = {};
  userObj.name = req.body.name || "";
  userObj.email = req.body.email;
  userObj.password = req.body.password;

  if ( userObj.name.length === 0 || !validator.isEmail(userObj.email) || userObj.password.length < 8 ) {
    resp.status(400).json({msg: "invalid request params"});
    return ;
  }

  let res = await userService.add(userObj);
  if (res) {
    resp.status(200).json({msg: "Sign-Up successfull"});
  } else {
    resp.status(500).json();
  }

};

exports.signInHandler = (req, resp) => {
  winston.debug('Authenticating ...');

  if (!validator.isEmail(req.body.email) || req.body.password.length < 8) {
    resp.status(400).json({msg: 'invalid request params'});
    return ;
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      winston.error('Sign-in Controller Error');
      winston.debug(err);
      resp.status(500).json('Login Server Error');
    }
    if (!user) {
      winston.info(`User with provided credentials not authenticated ( ${user.email} )`);
      resp.status(401).json('Login not authorized');
    } else {
      winston.info(`User authenticated successfully ${user.email}`);
      const token = userService.generateToken(user);
      resp.status(200).json({
        _id: user._id,
        email: user.email,
        name: user.name,
        token: token
      });
    }
  })(req,resp);

};


exports.getLikedHandler = async (req, resp) => {
  // TODO-code-challenge: Bonus: As a User, I can display the list of preferred workshops
  // See userService.getLikedWorkshops
  resp.status(200).json([]);
};

exports.addToLikedHandler = async (req, resp) => {
  let idWorkshop = req.params.id;
  let idUser = req.token.id;
  winston.debug(`Adding workshop ${idWorkshop} to Liked list of user ${idUser}`);

  let workshop = await workshopService.getById(idWorkshop);
  if (workshop === false || workshop === null) {
    resp.status(500).json();
  }
  if (await userService.likeWorkshop(idUser, workshop) ) {
    resp.status(200).json();
  } else {
    resp.status(500).json();
  }

};


exports.removeFromLikedHandler = async (req, resp) => {
  // TODO-code-challenge: Bonus: As a User, I can remove a workshop from my preferred workshops list
  resp.status(200).json();
};

exports.addToDislikedHandler = async (req, resp) => {
  let idWorkshop = req.params.id;
  let idUser = req.token.id;
  winston.debug(`Adding workshop ${idWorkshop} to disliked list of user ${idUser}`);

  let workshop = await workshopService.getById(idWorkshop);
  if (workshop === false || workshop === null) {
    resp.status(500).json();
  }

  if (await userService.dislikeWorkshop(idUser, workshop) ) {
    resp.status(200).json();
  } else {
    resp.status(500).json();
  }
  resp.status(200).json();
};