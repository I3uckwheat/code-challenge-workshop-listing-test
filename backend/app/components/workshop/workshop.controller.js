const winston = require('winston');

const workshopService = require('./workshop.service');

exports.getNearby = async (req, resp) => {
  winston.debug(`Getting nearby workshops for user ${req.token.id}`);
  let longitude = req.query.x || null;
  let latitude = req.query.y || null;
  console.log(longitude, latitude);
  let workshops = await workshopService.getNearby(req.token.id, longitude, latitude);
  if (workshops === false) {
    resp.status(500).json();
  } else {
    resp.status(200).json(workshops);
  }
};

exports.getPreferred = async (req, resp) => {
  winston.debug(`Getting nearby preferred for user ${req.token.id}`);
  let longitude = req.query.x || null;
  let latitude = req.query.y || null;
  console.log(longitude, latitude);
  let workshops = await workshopService.getPreferred(req.token.id, longitude, latitude);
  if (workshops === false) {
    resp.status(500).json();
  } else {
    resp.status(200).json(workshops);
  }
};
