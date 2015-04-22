var cv = require("cloudcv-backend")
var http = require('http')
var async = require('async')

exports.detect = function(url,type,cb) {
	var detections = []
	var err = null
	
	
http.get(url, function(res) {
  var data = [];

  res.on('data', function(chunk) {
    data.push(chunk);
  }).on('end', function() {
  //at this point data is an array of Buffers
  //so Buffer.concat() can make us a new Buffer
  //of all of them together
  var buffer = Buffer.concat(data);
   console.log(buffer.toString('base64'));
  cv.detectObjects(buffer, function(error, result)
  {
    async.map(result,function(item,map_cb){
     var o = {
      x_min: item.x,
      x_max: item.x + item.width,
      y_min: item.y,
      y_max: item.y+ item.height
     }
     map_cb(null,o)
    },function(e,detections){
      //console.log(detections);
      cb(e, detections);
    })
    
 })

  });
});

//detections.push({x_min:0,y_min:0,x_max:10,y_max:10});
//cb(null,detections);

}

// http://dev.virtualearth.net/mapcontrol/HumanScaleServices/GetBubbles.ashx?c=1&n=40.01910&s=40.01758&e=-105.27450&w=-105.27575
//40.01758,-105.27575
//40.01910,-105.27450
