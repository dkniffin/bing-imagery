(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\app.js":[function(require,module,exports){
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

  var type = 'faces';

  var data = map.getNSEW();
  data['type'] = type;
  //send stuff to the backend
  bi.send(data,function(detection){
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

},{"./backend-interface.js":"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\backend-interface.js","./map.js":"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\map.js"}],"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\backend-interface.js":[function(require,module,exports){
map = require('./map.js');
var socket = io('http://localhost');
function send(data,cb) {
	// boundingBox should be an object like {top: <top>, bottom: <bottom>, left: <left>, right: <right>}

	socket.on('receiveDetection', cb);
	// TODO: send lat/lon to backend
	// TODO: recieve data and/or images from backend
	//console.log(JSON.stringify(boundingBox));
	socket.emit('getDetection', data);
}

exports.send = send;

},{"./map.js":"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\map.js"}],"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\map.js":[function(require,module,exports){
var map;
var locationFilter;
var markers;

exports.init = function() {
	map = L.map('myMap',{maxZoom: 22}).setView([40.018,-105.2755], 18);
	// Layers
	var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{maxNativeZoom: 19, maxZoom: 22});
	var bing = new L.BingLayer("Ao0pgKJiEzVEWKCChHTB5JBezW9XvoM4WESpeYywz8wBY9kkWrZWNdKBZmmqz21Y",
		{maxNativeZoom: 19, maxZoom: 22});
	map.addLayer(bing);
	map.addControl(new L.Control.Layers({'OSM':osm, "Bing":bing}, {}));

	markers = new L.MarkerClusterGroup();
	map.addLayer(markers);

	// Add a bounding box selector to the map
	locationFilter = new L.LocationFilter({
		bounds: L.LatLngBounds([[40.018718, -105.276061],[40.017978, -105.274441]]),
		enable: true});
	locationFilter.addTo(map);
}
exports.addMarker = function(cube_id,lat,lon) {
	//console.log(detection);
	var marker = L.marker(new L.LatLng(lat, lon));
	marker.bindPopup('<h1> foo </h1>');
	markers.addLayer(marker);
	return marker;
}
exports.getNSEW = function() {
	// Read the bounding box
	var bounds = locationFilter.getBounds();
	return { n: bounds.getNorth(), s: bounds.getSouth(), e: bounds.getEast(), w: bounds.getWest() }
}
},{}]},{},["C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXEFwcERhdGFcXFJvYW1pbmdcXG5wbVxcbm9kZV9tb2R1bGVzXFx3YXRjaGlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2JhY2tlbmQtaW50ZXJmYWNlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL21hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJyk7XHJcbmJpID0gcmVxdWlyZSgnLi9iYWNrZW5kLWludGVyZmFjZS5qcycpO1xyXG5tYXAgPSByZXF1aXJlKCcuL21hcC5qcycpXHJcbm1hcC5pbml0KCk7XHJcblxyXG5mdW5jdGlvbiBnZXRRdWFkcmFudChudW0sIHJvd3MsIGNvbHMsIHBvcykge1xyXG4gIGlmIChyb3dzID09PSAxIHx8IGNvbHMgPT09IDEpIHJldHVybiBwb3M7XHJcblxyXG4gIHZhciByb3cgPSBNYXRoLmZsb29yKG51bSAvIHJvd3MpO1xyXG4gIHZhciBjb2wgPSBudW0gJSBjb2xzO1xyXG4gIHZhciBxdWFkO1xyXG5cclxuICBzdWJSb3dzID0gcm93cy8yO1xyXG4gIHN1YkNvbHMgPSBjb2xzLzI7XHJcblxyXG4gIGlmIChyb3cgPCBzdWJSb3dzKSB7XHJcbiAgICBpZiAoY29sIDwgc3ViQ29scykgcXVhZCA9IDA7XHJcbiAgICBlbHNlIHF1YWQgPSAxO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGlmIChjb2wgPCBzdWJDb2xzKSBxdWFkID0gMjtcclxuICAgIGVsc2UgcXVhZCA9IDM7XHJcbiAgfVxyXG5cclxuICBpZiAocXVhZCA9PSAwKSB7XHJcbiAgICBudW0gPSAoY29sKSArIChzdWJSb3dzICogcm93KTtcclxuICB9XHJcbiAgZWxzZSBpZiAocXVhZCA9PSAxKSB7XHJcbiAgICBudW0gPSAoY29sIC0gc3ViQ29scykgKyAoc3ViUm93cyAqIHJvdyk7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKHF1YWQgPT0gMikge1xyXG4gICAgbnVtID0gKGNvbCkgKyAoc3ViUm93cyAqIChyb3cgLSBzdWJSb3dzKSk7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKHF1YWQgPT0gMykge1xyXG4gICAgbnVtID0gKGNvbCAtIHN1YkNvbHMpICsgKHN1YlJvd3MgKiAocm93IC0gc3ViUm93cykpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGdldFF1YWRyYW50KG51bSwgc3ViUm93cywgc3ViQ29scywgcG9zICs9IHF1YWQudG9TdHJpbmcoKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBvc2l0aW9uKG51bSkge1xyXG4gIHJldHVybiBnZXRRdWFkcmFudChudW0sIDgsIDgsICcnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlTW9kYWwoaWQpIHtcclxuICB2YXIgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBtb2RhbC5pZCA9IGlkO1xyXG4gIG1vZGFsLmNsYXNzTmFtZSA9ICdtb2RhbCc7XHJcblxyXG4gIGZvciAodmFyIGogPSAwOyBqIDwgNjQ7IGorKykge1xyXG4gICAgdmFyIG1vZGFsSW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICBtb2RhbEltZy5zcmMgPSBcImh0dHA6Ly9lY24udDEudGlsZXMudmlydHVhbGVhcnRoLm5ldC90aWxlcy9oczBcIiArIGlkICsgZ2V0UG9zaXRpb24oaikgK1wiLmpwZz9nPTI5ODEmbj16XCJcclxuICAgIG1vZGFsLmFwcGVuZENoaWxkKG1vZGFsSW1nKTtcclxuICB9XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKG1vZGFsLCBkb2N1bWVudC5ib2R5LmNoaWxkTm9kZXNbMF0pO1xyXG4gICQoJyMnICsgaWQpLmVhc3lNb2RhbCh7dG9wOiA3NX0pO1xyXG4gICQoJyMnICsgaWQpLnRyaWdnZXIoJ29wZW5Nb2RhbCcpO1xyXG5cclxufVxyXG5cclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAvLyBPYmplY3QgZm9yIHN0b3JpbmcgZGV0ZWN0aW9uc1xyXG4gIC8vIFNob3VsZCBtYXAgY3ViZV9pZCB0byBhcnJheXMgb2YgZGV0ZWN0aW9uc1xyXG4gIHZhciBkZXRlY3Rpb25zID0ge31cclxuXHJcbiAgdmFyIHR5cGUgPSAnZmFjZXMnO1xyXG5cclxuICB2YXIgZGF0YSA9IG1hcC5nZXROU0VXKCk7XHJcbiAgZGF0YVsndHlwZSddID0gdHlwZTtcclxuICAvL3NlbmQgc3R1ZmYgdG8gdGhlIGJhY2tlbmRcclxuICBiaS5zZW5kKGRhdGEsZnVuY3Rpb24oZGV0ZWN0aW9uKXtcclxuICAgIHZhciBiYXNlNF9pZF9zdHJpbmcgPSBkZXRlY3Rpb24uY3ViZV9pZC50b1N0cmluZyg0KTtcclxuXHJcbiAgXHRpZiAoZGV0ZWN0aW9uc1tkZXRlY3Rpb24uY3ViZV9pZF0gPT0gbnVsbCkge1xyXG4gIFx0XHRkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXSA9IFtdO1xyXG4gIFx0XHR2YXIgbWFya2VyID0gbWFwLmFkZE1hcmtlcihkZXRlY3Rpb24uY3ViZV9pZCxkZXRlY3Rpb24ubGF0LGRldGVjdGlvbi5sb24pO1xyXG5cclxuXHRcdFx0dmFyIHBvcHVwID0gbWFya2VyLmJpbmRQb3B1cChmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29udGVudCA9ICc8ZGl2IGNsYXNzPVwiaW1nX3BvcHVwXCI+J1xyXG4gICAgICAgIGRldGVjdGlvbnNbZGV0ZWN0aW9uLmN1YmVfaWRdLmZvckVhY2goZnVuY3Rpb24oZCl7XHJcbiAgICAgICAgICB2YXIgdyA9IGQuZGV0ZWN0X2Nvb3Jkcy54X21heCAtIGQuZGV0ZWN0X2Nvb3Jkcy54X21pbjtcclxuICAgICAgICAgIC8vIHZhciB3ID0gNTA7XHJcbiAgICAgICAgICB2YXIgaCA9IGQuZGV0ZWN0X2Nvb3Jkcy55X21heCAtIGQuZGV0ZWN0X2Nvb3Jkcy55X21pbjtcclxuICAgICAgICAgIHZhciB0b3AgPSBkLmRldGVjdF9jb29yZHMueV9taW47XHJcbiAgICAgICAgICB2YXIgbGVmdCA9IGQuZGV0ZWN0X2Nvb3Jkcy54X21pbjtcclxuXHJcbiAgICAgICAgICB2YXIgZW5kX3cgPSA1MDsgLy8gU2l6ZSBvZiB0aGUgZGlzcGxheWVkIGRldGVjdGlvblxyXG4gICAgICAgICAgdmFyIHNjYWxlID0gZW5kX3cvdzsgLy8gSG93IG11Y2ggdG8gc2NhbGUgdGhlIGltYWdlIGJ5IHRvIGdldCB0aGUgcHJvcGVyIGVuZC1zaXplXHJcblxyXG4gICAgICAgICAgdmFyIGlubGluZV9jc3MgPSAnd2lkdGg6ICcgKyB3ICogc2NhbGUgKyAnOyc7XHJcbiAgICAgICAgICBpbmxpbmVfY3NzICs9ICdoZWlnaHQ6ICcgKyBoICogc2NhbGUgKyAnOyc7XHJcbiAgICAgICAgICBpbmxpbmVfY3NzICs9ICdiYWNrZ3JvdW5kOiB1cmwoJyArIGQudXJsICsgJykgJyArIGxlZnQgKyAnICcgKyB0b3AgKyAnOydcclxuICAgICAgICAgIGlubGluZV9jc3MgKz0gJ2JhY2tncm91bmQtc2l6ZTogJyArIDI1NiAqIHNjYWxlICsgJ3B4OydcclxuICAgICAgICAgIGNvbnRlbnQgKz0gJzxkaXYgY2xhc3M9XCJwb3B1cEltYWdlXCIgc3R5bGU9XCInICsgaW5saW5lX2NzcyArICdcIj48L2Rpdj4nO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb250ZW50ICs9ICc8L2Rpdj4nXHJcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XHJcbiAgICAgIH0pLmdldFBvcHVwKCk7XHJcblxyXG4gICAgICBwb3B1cC5vbignY29udGVudHVwZGF0ZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBpbWdzID0gdGhpcy5fY29udGVudE5vZGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncG9wdXBJbWFnZScpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nc1tpXS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSB0aGlzLnN0eWxlLmJhY2tncm91bmRJbWFnZTtcclxuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHVybC5zbGljZSh1cmwuaW5kZXhPZignLmpwZycpIC0gNSwgdXJsLmluZGV4T2YoJy5qcGcnKSAtIDMpO1xyXG4gICAgICAgICAgICB2YXIgaWQgPSBiYXNlNF9pZF9zdHJpbmcgKyBkaXJlY3Rpb247XHJcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpKSB7XHJcbiAgICAgICAgICAgICAgY3JlYXRlTW9kYWwoaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcblxyXG4gIFx0fVxyXG4gIFx0ZGV0ZWN0aW9uc1tkZXRlY3Rpb24uY3ViZV9pZF0ucHVzaChkZXRlY3Rpb24pXHJcblxyXG5cclxuICB9KTtcclxufVxyXG4iLCJtYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xyXG52YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcclxuZnVuY3Rpb24gc2VuZChkYXRhLGNiKSB7XHJcblx0Ly8gYm91bmRpbmdCb3ggc2hvdWxkIGJlIGFuIG9iamVjdCBsaWtlIHt0b3A6IDx0b3A+LCBib3R0b206IDxib3R0b20+LCBsZWZ0OiA8bGVmdD4sIHJpZ2h0OiA8cmlnaHQ+fVxyXG5cclxuXHRzb2NrZXQub24oJ3JlY2VpdmVEZXRlY3Rpb24nLCBjYik7XHJcblx0Ly8gVE9ETzogc2VuZCBsYXQvbG9uIHRvIGJhY2tlbmRcclxuXHQvLyBUT0RPOiByZWNpZXZlIGRhdGEgYW5kL29yIGltYWdlcyBmcm9tIGJhY2tlbmRcclxuXHQvL2NvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGJvdW5kaW5nQm94KSk7XHJcblx0c29ja2V0LmVtaXQoJ2dldERldGVjdGlvbicsIGRhdGEpO1xyXG59XHJcblxyXG5leHBvcnRzLnNlbmQgPSBzZW5kO1xyXG4iLCJ2YXIgbWFwO1xyXG52YXIgbG9jYXRpb25GaWx0ZXI7XHJcbnZhciBtYXJrZXJzO1xyXG5cclxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0bWFwID0gTC5tYXAoJ215TWFwJyx7bWF4Wm9vbTogMjJ9KS5zZXRWaWV3KFs0MC4wMTgsLTEwNS4yNzU1XSwgMTgpO1xyXG5cdC8vIExheWVyc1xyXG5cdHZhciBvc20gPSBuZXcgTC5UaWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vcGVuc3RyZWV0bWFwLm9yZy97en0ve3h9L3t5fS5wbmcnLFxyXG5cdFx0e21heE5hdGl2ZVpvb206IDE5LCBtYXhab29tOiAyMn0pO1xyXG5cdHZhciBiaW5nID0gbmV3IEwuQmluZ0xheWVyKFwiQW8wcGdLSmlFelZFV0tDQ2hIVEI1SkJlelc5WHZvTTRXRVNwZVl5d3o4d0JZOWtrV3JaV05kS0JabW1xejIxWVwiLFxyXG5cdFx0e21heE5hdGl2ZVpvb206IDE5LCBtYXhab29tOiAyMn0pO1xyXG5cdG1hcC5hZGRMYXllcihiaW5nKTtcclxuXHRtYXAuYWRkQ29udHJvbChuZXcgTC5Db250cm9sLkxheWVycyh7J09TTSc6b3NtLCBcIkJpbmdcIjpiaW5nfSwge30pKTtcclxuXHJcblx0bWFya2VycyA9IG5ldyBMLk1hcmtlckNsdXN0ZXJHcm91cCgpO1xyXG5cdG1hcC5hZGRMYXllcihtYXJrZXJzKTtcclxuXHJcblx0Ly8gQWRkIGEgYm91bmRpbmcgYm94IHNlbGVjdG9yIHRvIHRoZSBtYXBcclxuXHRsb2NhdGlvbkZpbHRlciA9IG5ldyBMLkxvY2F0aW9uRmlsdGVyKHtcclxuXHRcdGJvdW5kczogTC5MYXRMbmdCb3VuZHMoW1s0MC4wMTg3MTgsIC0xMDUuMjc2MDYxXSxbNDAuMDE3OTc4LCAtMTA1LjI3NDQ0MV1dKSxcclxuXHRcdGVuYWJsZTogdHJ1ZX0pO1xyXG5cdGxvY2F0aW9uRmlsdGVyLmFkZFRvKG1hcCk7XHJcbn1cclxuZXhwb3J0cy5hZGRNYXJrZXIgPSBmdW5jdGlvbihjdWJlX2lkLGxhdCxsb24pIHtcclxuXHQvL2NvbnNvbGUubG9nKGRldGVjdGlvbik7XHJcblx0dmFyIG1hcmtlciA9IEwubWFya2VyKG5ldyBMLkxhdExuZyhsYXQsIGxvbikpO1xyXG5cdG1hcmtlci5iaW5kUG9wdXAoJzxoMT4gZm9vIDwvaDE+Jyk7XHJcblx0bWFya2Vycy5hZGRMYXllcihtYXJrZXIpO1xyXG5cdHJldHVybiBtYXJrZXI7XHJcbn1cclxuZXhwb3J0cy5nZXROU0VXID0gZnVuY3Rpb24oKSB7XHJcblx0Ly8gUmVhZCB0aGUgYm91bmRpbmcgYm94XHJcblx0dmFyIGJvdW5kcyA9IGxvY2F0aW9uRmlsdGVyLmdldEJvdW5kcygpO1xyXG5cdHJldHVybiB7IG46IGJvdW5kcy5nZXROb3J0aCgpLCBzOiBib3VuZHMuZ2V0U291dGgoKSwgZTogYm91bmRzLmdldEVhc3QoKSwgdzogYm91bmRzLmdldFdlc3QoKSB9XHJcbn0iXX0=
