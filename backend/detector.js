// var cv = require("cloudcv-backend")
var opencv = require('opencv')
var http = require('http')
var async = require('async')


var url = process.env.url
var type = process.env.type

// console.log("in worker",url)

var type_cascade_map = {
  'faces'         : 'haarcascade_frontalface_alt.xml',
  'license'       : 'haarcascade_russian_plate_number.xml',
  'housenumbers'  : 'housenumbers.xml',
  'car_side'      : 'hogcascade_cars_sideview.xml',
  'car_frontback' : 'lbpcascade_cars_frontbackview.xml',
  'full_body'     : 'haarcascade_fullbody.xml'
}

var detections = []
var err = null


function getBuffer(url,cb) {
  http.get(url, function(res) {
    var data = [];

    res.on('data', function(chunk) {
      data.push(chunk);
    }).on('end', function() {
      // At this point data is an array of Buffers so Buffer.concat() can make
      // us a new Buffer of all of them together
      var buffer = Buffer.concat(data);
      // console.log('Finding detections for ' + url)
      cb(buffer)
    });
  });
}


function opencvDetect(buffer,cb) {
  opencv.readImage(buffer, function(err, im){
    im.detectObject("cascades/" + type_cascade_map[type], {}, cb);
  });
}

console.log('running detector on ' + url)
getBuffer(url,function(buffer){
  opencvDetect(buffer,function(err, detections){
    // console.log(detections)
    // console.log(cascade)
    async.map(detections,function(item,map_cb){
      var o = {
        x_min: item.x,
        x_max: item.x + item.width,
        y_min: item.y,
        y_max: item.y+ item.height
      }
      map_cb(null,o)
    },function(e,detections){
      process.send({detections: detections})
      process.exit();
    })
  })
})

//detections.push({x_min:0,y_min:0,x_max:10,y_max:10});
//cb(null,detections);

// http://dev.virtualearth.net/mapcontrol/HumanScaleServices/GetBubbles.ashx?c=1&n=40.01910&s=40.01758&e=-105.27450&w=-105.27575
//40.01758,-105.27575
//40.01910,-105.27450
