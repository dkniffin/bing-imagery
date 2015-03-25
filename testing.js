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



var backend = require('./backend/main.js')
var db = require('./backend/db.js')

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

db.detectionsInBounds(41.1,40.0,-105.0,-105.5,function(err,detection){
	console.log(err,detection)
})

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