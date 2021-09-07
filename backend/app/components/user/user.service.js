const winston = require('winston');

const User = require('./user.model');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = require('../../config/web')[process.env.NODE_ENV || 'dev']["JWT_SECRET"];

exports.generateToken = (userObj) => {
  return jwt.sign({
    id: userObj.id,
    name: userObj.name,
    email: userObj.email
  }, JWT_SECRET, {expiresIn: 3600});
};

exports.add = async (userObj) => {
  const existingUser = await User.findOne({email: userObj.email});
  if(existingUser) return false; 

  let user = new User();
  user.name = userObj.name;
  user.email = userObj.email;
  user.password = bcrypt.hashSync(userObj.password, 10);

  try {
    await user.save();
    return true;
  } catch (err) {
    winston.error('UserService: Error adding user');
    return false;
  }
};


exports.getLikedWorkshops = async (id) => {
  try {
    let user = await User.findById(id);
    return user.likedWorkshops;
  } catch (err) {
    winston.error(`User Service: Error getting liked workshops for user with ID ${id}` );
    return null ;
  }
};

exports.getDislikedWorkshops = async (id) => {
  try {
    let user = await User.findById(id);
    return user.dislikedWorkshops;
  } catch (err) {
    winston.error(`User Service: Error getting disliked workshops for user with ID ${id}` );
    return null ;
  }
};

exports.likeWorkshop = async (idUser, workshop) => {
  winston.debug(`User Service : Liking workshop ${workshop.name} by user ${idUser}`);

  try {
    let user = await User.findById(idUser);

    // Prevent record from being duplicated if already existing on user
    // Update time if already liked
    const hasLiked = user.likedWorkshops.find((likedWorkshop) => likedWorkshop._id.equals(workshop._id));
    if(!hasLiked) {
      user.likedWorkshops.push(workshop._id);
    } else {
      hasLiked.likedTime = new Date();
    }

    await user.save();
    return true;
  } catch (err) {
    winston.error(`User Service: Error in Liking workshop ${workshop._id} by user ${idUser}`);
    winston.debug(err);
    return false;
  }
};

exports.unlikeWorkshop = async (idUser, workshop) => {
  winston.debug(`User Service : Un-liking workshop ${workshop.name} by user ${idUser}`);

  try {
    let user = await User.findById(idUser);
    // check if the workshop is already in the array, if yes update only the time.
    for (let [index, el] of user.likedWorkshops.entries()) {
      if (el._id.equals(workshop._id)) {
        winston.debug('Found Workshop to be removed !');
        user.likedWorkshops.splice(index,1);
        break;
      }
    }
    await user.save();
    return true;
  } catch (err) {
    winston.error(`User Service: Error in un-liking workshop ${workshop._id} by user ${idUser}`);
    winston.debug(err);
    return false;
  }
};

exports.dislikeWorkshop = async (idUser, workshop) => {
  winston.debug(`User Service : Disliking workshop ${workshop.name} by user ${idUser}`);

  try {
    let user = await User.findById(idUser);

    // Prevent record from being duplicated if already existing on user
    // Update time if already disliked
    const hasDisliked = user.dislikedWorkshops.find((dislikedWorkshop) => dislikedWorkshop._id.equals(workshop._id));
    if(!hasDisliked) {
      user.dislikedWorkshops.push(workshop._id);
    } else {
      hasDisliked.dislikedTime = new Date();
    }

    await user.save();
    return true;
  } catch (err) {
    winston.error(`User Service: Error in disliking workshop ${workshop._id} by user ${idUser}`);
    winston.debug(err);
    return false;
  }
};