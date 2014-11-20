var express = require('express');
var router = express.Router();
var backend = require('../backend/main.js')

/* GET users listing. */
router.get('/', function(req, res) {
  //res.send('respond with a resource');
  // TODO: Look into gm and http://stackoverflow.com/a/12665226 for cropping image and sending result back
  // TODO: Check out http://stackoverflow.com/a/19386223 for sending back multiple images
  // TODO: We might also want to look into websockets if we want to send the images back asynchronously
  backend.getDetections(req.params.n,req.params.s,req.params.e,req.params.w)
  res.send()
});

module.exports = router;
