
const winston = require('winston');
const moment = require('moment');

const mongoose = require('mongoose');

const userService = require('../user/user.service');

const Workshop = require('./workshop.model');


exports.getById = async (id) => {
  try {
    winston.debug(`Workshop service getting by id ${id}`);
    return await Workshop.findById(id);
  } catch (err) {
    winston.error(`Workshop Service: Error getting workshop by id ${id}`);
    winston.debug(err);
    return false;
  }
}

exports.getNearby = async (id, longitude, latitude) => {
  try {
    winston.debug('Workshop service getting nearby workshops');
    // If coordinates are not specified just get the workshops as they are from the DB
    let workshops;
    if (longitude && latitude) {
      workshops = await Workshop.find({
        location: {
          // $near operator sorts results by distance: https://docs.mongodb.com/manual/reference/operator/query/near
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            }
          }
        }
      }).exec();
    } else {
      workshops = await Workshop.find();
    }

    // Get Special workshops ( liked & disliked )
    let likedWorkshops = await userService.getLikedWorkshops(id);
    let dislikedWorkshops = await userService.getDislikedWorkshops(id);
    let specialWorkshops = [...likedWorkshops, ...dislikedWorkshops];
    console.log(specialWorkshops);

    // If Liked || if Disliked less than two hours don't show
    return workshops.map(workshop => {
      for (let specialWorkshop of specialWorkshops) {
        if (workshop._id.equals(specialWorkshop._id)) {
          if (specialWorkshop.likedTime) {
            return {...workshop.toObject(), preferred: true};
          } else if (specialWorkshop.dislikedTime) {
            const twoHoursAgo = new Date();

            // Decrement now by 2 hours, JS date objects properly handle setting hours this way: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setHours
            twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

            if(specialWorkshop.dislikedTime > twoHoursAgo) {
              return {...workshop.toObject(), disliked: true};
            }
          }
        }
      }
      return workshop;
    });
  } catch (err) {
    winston.error('Workshop service Error: could not get nearby workshops');
    winston.debug(err);
    return false;
  }
};

exports.getPreferred = async (id, longitude, latitude) => {
  try {
    winston.debug('Workshop service getting preferred workshops');
    // If coordinates are not specified just get the workshops as they are from the DB
    let workshops;

    let likedWorkshopIds = (await userService.getLikedWorkshops(id)).map(workshop => workshop._id);

    if (longitude && latitude) {
      workshops = await Workshop.find({
        _id: {"$in": likedWorkshopIds},
        location: {
          // $near operator sorts results by distance: https://docs.mongodb.com/manual/reference/operator/query/near
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            }
          }
        }
      }).exec();
    } else {
     workshops = await Workshop.find({
        _id: {"in": likedWorkshopIds}
      });
    }

    return workshops.map(workshop => ({...workshop.toObject(), preferred: true}));
  } catch (err) {
    winston.error('Workshop service Error: could not get nearby workshops');
    winston.debug(err);
    return false;
  }
};
