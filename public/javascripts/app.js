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
  	if (detections[detection.cube_id] == null) {
  		detections[detection.cube_id] = [];
  		var marker = map.addMarker(detection.cube_id,detection.lat,detection.lon)

			marker.bindPopup(function() {
        var content = '<div class="img_popup">'
        detections[detection.cube_id].forEach(function(d){
          var w = d.detect_coords.x_max - d.detect_coords.x_min;
          // var w = 50;
          var h = d.detect_coords.y_max - d.detect_coords.y_min;
          var top = d.detect_coords.y_min;
          var left = d.detect_coords.x_min;

          var end_w = 50; // Size of the displayed detection
          var scale = end_w/w; // How much to scale the image by to get the proper end-size

          var inline_css = 'width: ' + w * scale + ';';
          inline_css += 'height: ' + h * scale + ';';
          inline_css += 'background: url(' + d.url + ') ' + left + ' ' + top + ';'
          inline_css += 'background-size: ' + 256 * scale + 'px;'
          inline_css += 'float: left;';
          inline_css += 'margin: 2px;'
          content += '<div style="' + inline_css + '"></div>';
        });

        content += '</div>'
        return content;

      });
  	}
  	detections[detection.cube_id].push(detection)


  });
}
