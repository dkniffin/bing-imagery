// Map = require('./map.js');
bi = require('./backend-interface.js');
map = require('./map.js')
map.init();

// var map = new Map(document.getElementById("myMap"), new Microsoft.Maps.Location(40, -105.27), 15);

document.getElementById("start").onclick = function() {

  // Object for storing detections
  // Should map cube_id to arrays of detections
  var detections = {}
  //send stuff to the backend
  bi.send(map.getNSEW(),function(detection){
  	console.log(detection.url)
  	if (detections[detection.cube_id] == null) {
  		detections[detection.cube_id] = [];
  		var marker = map.addMarker(detection.cube_id,detection.lat,detection.lon)
  		marker.data.popup = function(data,category){
  			var content = '<div class="img_popup">'
  			detections[detection.cube_id].forEach(function(d){
  				content += '<img src=' + d.url + '/>';
  			})
  			content += '</div>';
  			return content;
  		};
  	}
  	detections[detection.cube_id].push(detection)


  });
}