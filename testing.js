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

// backend.getDetections(40.0183993312,40.0176456418,-105.2750627995,-105.2760262489,function(detection,err){
// 	console.log(detection)
// })

// db.getDetectionsFromImgId('1',function(err,detection){
// 	console.log(detection)
// })

db.detections({cube_id: 123, direction: 1, zoom_coords: [0,0,0,0]},function(err,detection){
	console.log(err,detection)
})