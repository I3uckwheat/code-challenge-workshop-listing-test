
const express = require('express');
const router = express.Router();

const workshopController = require ('./workshop.controller');

module.exports = (auth) => {
  router.get('/nearby', auth, workshopController.getNearby);
  router.get('/preferred', auth, workshopController.getPreferred);
  return router;
};
