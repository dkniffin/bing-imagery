// Map = require('./map.js');

map.init();
var markersById = [];

function getQuadrant(num, rows, cols, pos) {
  if (rows === 1 || cols === 1) return pos;

  var row = Math.floor(num / rows);
  var col = num % cols;

  subRows = rows/2;
  subCols = cols/2;

  var quad = (col < subCols ? 0 : 1) + (row < subRows ? 0 : 2);
  num = col - (col >= subCols ? subCols : 0) + subRows * (row % subRows);

  return getQuadrant(num, subRows, subCols, pos += quad.toString());
}

function agnosticUrl(url) {
  return url.slice(url.indexOf('hs') + 2);
}

function createModal(id, detections) {
  var row;
  var modal = document.createElement('div');
  modal.id = id;
  modal.className = 'modal';

  for (var j = 0; j < 64; j++) {
    if (j % 8 === 0) {
      row = document.createElement('div');
      row.className = 'modalRow'
      modal.appendChild(row);
    }

    var url = "http://ecn.t1.tiles.virtualearth.net/tiles/hs" + id + getQuadrant(j, 8, 8, '') +".jpg?g=2981&n=z";
    var detectionsForUrl = _(detections).filter(
      function(detection) {
        return agnosticUrl(detection.url) === agnosticUrl(url);
      }
    ).value();

    if (detectionsForUrl.length !== 0) {

      var img = new Image;
      var canvas = document.createElement('canvas');
      var canvasHeight = parseInt(window.innerHeight / 8);
      var canvasWidth = 128;
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight
      row.appendChild(canvas);
      var ctx = canvas.getContext('2d');

      img.onload = function(img, ds){
        var hScale = canvasHeight / 256;
        this.drawImage(img, 0, 0, canvasWidth, canvasHeight)

        for (var i = 0; i < ds.length; i++)
        {
          var detect_coords = ds[i].detect_coords;
          var detectWidth = detect_coords.x_max - detect_coords.x_min;
          var detectHeight = detect_coords.y_max - detect_coords.y_min;
          this.beginPath();
          this.rect(detect_coords.x_min / 2, detect_coords.y_min * hScale, detectWidth / 2, detectHeight * hScale);
          this.strokeStyle = 'red';
          this.lineWidth = 2;
          this.stroke();
        }
      }.bind(ctx, img, detectionsForUrl)

      img.src = url;
    }
    else {
      var modalImg = new Image;
      modalImg.src = url;
      row.appendChild(modalImg);
    }
  }

  document.body.insertBefore(modal, document.body.childNodes[0]);
  $('#' + id).easyModal({
    left: parseInt($('#main').css('left')),
    top: 0
  });
  $('#' + id).trigger('openModal');
}

function base4(dec) {
  return Number(dec).toString(4);
}

function pad(num, size) {
   var s = num+"";
   while (s.length < size) s = "0" + s;
   return s;
}

function setStartHTML(i, c) {
  $("#start").html(Math.round(100 * i / c) + '% Processed');
}

document.getElementById("start").onclick = function() {
  // Object for storing detections
  // Should map cube_id to arrays of detections

  if ( $("#start").attr('class') === 'progress' ) return;

  $("#start").attr('class', 'progress');
  setStartHTML(0, 1);

  var detections = {};
  var totalImageCount = -1;
  var imagesProcessed = 0;

  var type = document.getElementById('dropdown').value;

  var data = map.getNSEW();
  data['type'] = type;
  //send stuff to the backend
  bi.send(data, function(detection){
    var cubeId = detection.cube_id;
    var base4_id_string = pad(base4(cubeId),16);

    detections[cubeId] = detections[cubeId] || []

  	if (detections[cubeId].length === 0 && markersById.indexOf(cubeId) === -1) {
  		var marker = map.addMarker(cubeId,detection.lat,detection.lon);
      markersById.push(cubeId)

			var popup = marker.bindPopup(function() {
        var content = '<div class="img_popup">'
        detections[cubeId].forEach(function(d){
          var w = d.detect_coords.x_max - d.detect_coords.x_min;
          // var w = 50;
          var h = d.detect_coords.y_max - d.detect_coords.y_min;
          var top = d.detect_coords.y_min;
          var left = d.detect_coords.x_min;

          var end_w = 50; // Size of the displayed detection
          var scale = end_w/w; // How much to scale the image by to get the proper end-size

          var inline_css = 'width: ' + end_w + ';';
          inline_css += 'height: ' + end_w + ';';
          inline_css += 'background: url(' + d.url + ') ' + (left * -scale) + 'px ' + (top * -scale) + 'px;'
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
              createModal(id, detections[cubeId]);
            }
            else {
              $('#'+id).trigger('openModal');
            }
          }

        }
      })


  	}
  	detections[cubeId].push(detection)


  },function(count) {
    totalImageCount = count;
    setStartHTML(imagesProcessed, totalImageCount);
  },
  function() {
    imagesProcessed++;
    if (imagesProcessed === totalImageCount) {
      totalImageCount = -1;
      imagesProcessed = 0;
      $("#start").attr('class', 'button');
      $("#start").html('Start');
      return;
    }
    setStartHTML(imagesProcessed, totalImageCount);
  });
}
