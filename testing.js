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


backend.getDetections(-105.2760262489,40.0183993312,-105.2750627995,40.0176456418)