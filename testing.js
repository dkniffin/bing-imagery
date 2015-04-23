// var cv = require('opencv')

// cv.readImage("./mona.png", function(err, im){
//   im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
//     for (var i=0;i<faces.length; i++){
//       var x = faces[i]
//       im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
//     }
//     im.save('./out.jpg');
//   });
// })


var cv = require("opencv")
var async = require('async')


var http = require('http');

var images = [
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010000.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010010.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010200.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010100.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010220.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010320.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010110.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010300.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010310.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010030.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010020.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010130.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010001.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010230.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010120.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010101.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010330.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010210.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010301.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010201.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010021.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010211.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010121.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010221.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010111.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010131.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010311.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203010321.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001000.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001010.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001200.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001100.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001220.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001320.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001110.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001300.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001310.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001030.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001020.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001130.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001001.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001230.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001120.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001101.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001330.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001210.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001301.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001201.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001021.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001211.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001121.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001221.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001111.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001131.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001311.jpg?g=2981&n=z',
'http://ak.t1.tiles.virtualearth.net/tiles/hs021000333323203001321.jpg?g=2981&n=z'
  ]
async.eachLimit(images,3,function(url,each_cb){
  http.get(url, function(res) {
    var data = [];

    res.on('data', function(chunk) {
      data.push(chunk);
    }).on('end', function() {
      // At this point data is an array of Buffers so Buffer.concat() can make
      // us a new Buffer of all of them together
      var buffer = Buffer.concat(data);
      console.log('Finding detections for ' + url)

      cv.readImage(buffer, function(err, im){
        im.detectObject(cv.FACE_CASCADE, {}, function(error, result) {
            console.log(error, result);
            each_cb();
        })
      })
    })
  })
})

// var backend = require('./backend/main.js')
// var db = require('./backend/db.js')

// db.detections('1234',function(err,detections){
// 	if (err == 'NoDetectionsError') {
// 		console.log('no detections found')
// 	} else {
// 		console.log(detections);
// 	}
// })

// Gets all detections within a bounding box
// backend.getDetections(40.0183993312,40.0176456418,-105.2750627995,-105.2760262489,function(detection,err){
// 	console.log(detection)
// })

// 3 cubes
// backend.getDetections(40.0181,40.018,-105.27,-105.2705,function(err,detection){
// 	console.log(detection)
// })

// db.detectionsInBounds(41.1,40.0,-105.0,-105.5,function(err,detection){
// 	console.log(err,detection)
// })

// Database tests
// Gets detections with a given img id
// db.getDetectionsFromImageId('4',function(err,detection){
// 	console.log(detection)
// })

// Gets all detections for a given imgObj
// db.detections({cube_id: 1234, direction: 1, zoom_coords: [0,0,0,0]},function(err,detection){
// 	console.log(err,detection)
// })

// Gets image id
// db.getImageId({cube_id: 123, direction: 1, zoom_coords: [0,0,0,0]},function(err,imgId){
// 	console.log(imgId)
// })

// Adds an image to the database, returning the image id
// db.addImage({cube_id: 123, direction: 1, zoom_coords: [0,0,0,0]},function(err,imgId){
// 	console.log(imgId)
// })

// Adds a detection to the database
// db.addDetection({cube_id: 1234, direction: 1, zoom_coords: [0,0,0,0]},
// 				{x_min: 0, x_max: 0, y_min: 0, y_max: 0},
// 				function(err,detectionId){
// 	console.log(detectionId)
// })
