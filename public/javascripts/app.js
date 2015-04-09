// Map = require('./map.js');
bi = require('./backend-interface.js');
map = require('./map.js')
map.init();

function getQuadrant(num, rows, cols, pos) {
  if (rows === 1 || cols === 1) return pos;

  var row = Math.floor(num / rows);
  var col = num % cols;
  var quad;

  subRows = rows/2;
  subCols = cols/2;

  if (row < subRows) {
    if (col < subCols) quad = 0;
    else quad = 1;
  }
  else {
    if (col < subCols) quad = 2;
    else quad = 3;
  }

  if (quad == 0) {
    num = (col) + (subRows * row);
  }
  else if (quad == 1) {
    num = (col - subCols) + (subRows * row);
  }
  else if (quad == 2) {
    num = (col) + (subRows * (row - subRows));
  }
  else if (quad == 3) {
    num = (col - subCols) + (subRows * (row - subRows));
  }

  return getQuadrant(num, subRows, subCols, pos += quad.toString());
}

function getPosition(num) {
  return getQuadrant(num, 8, 8, '');
}

function createModal(id) {
  var modal = document.createElement('div');
  modal.id = id;
  modal.className = 'modal';

  for (var j = 0; j < 64; j++) {
    var modalImg = document.createElement('img');
    modalImg.src = "http://ecn.t1.tiles.virtualearth.net/tiles/hs0" + id + getPosition(j) +".jpg?g=2981&n=z"
    modal.appendChild(modalImg);
  }

  document.body.insertBefore(modal, document.body.childNodes[0]);
  $('#' + id).easyModal({top: 75});
  $('#' + id).trigger('openModal');

}


document.getElementById("start").onclick = function() {

  // Object for storing detections
  // Should map cube_id to arrays of detections
  var detections = {}
  //send stuff to the backend
  bi.send(map.getNSEW(),function(detection){
    var base4_id_string = detection.cube_id.toString(4);

  	if (detections[detection.cube_id] == null) {
  		detections[detection.cube_id] = [];
  		var marker = map.addMarker(detection.cube_id,detection.lat,detection.lon);

			var popup = marker.bindPopup(function() {
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
          content += '<div class="popupImage" style="' + inline_css + '"></div>';
        });

        content += '</div>'
        return content;
      }).getPopup();

      popup.on('contentupdate', function() {
        var imgs = this._contentNode.getElementsByClassName('popupImage');
        for (var i = 0; i < imgs.length; i++) {
          imgs[i].onclick = function() {
            var url = this.style.backgroundImage;
            var direction = url.slice(url.indexOf('.jpg') - 5, url.indexOf('.jpg') - 3);
            var id = base4_id_string + direction;
            if (!document.getElementById(id)) {
              createModal(id);
            }
          }

        }
      })


  	}
  	detections[detection.cube_id].push(detection)


  });
}
