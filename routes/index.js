var express = require('express');
var http = require('http').Server(express);
var io = require('socket.io')(http);
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


/* Socket.io handles sending coordinates to the console (coordinates undefined right now) */
//SENDER FUNCTION
//the actual n,s,e,w coordinates are probably going to be taken from richarads /public/javascripts/map.js file
// io.on('connection', function (socket) {
// 	socket.on('onclick', function (n,s,e,w){
// 		getDetections(n,s,e,w)
// 	})
// })


//LISTENER FUNCTION
//this is gonna be a url and a bounding box in an image
//or going to be an image in itself
//Use base-64 encoded data image, then decode it into an image url or something...



module.exports = router;
