(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\app.js":[function(require,module,exports){
// Map = require('./map.js');
bi = require('./backend-interface.js');
map = require('./map.js')
map.init();

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

function createModal(id) {
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

    var modalImg = document.createElement('img');
    modalImg.src = "http://ecn.t1.tiles.virtualearth.net/tiles/hs0" + id + getQuadrant(j, 8, 8, '') +".jpg?g=2981&n=z"
    row.appendChild(modalImg);
  }

  document.body.insertBefore(modal, document.body.childNodes[0]);
  $('#' + id).easyModal({
    left: parseInt($('#main').css('left')),
    top: 0
  });
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
            else {
              $('#'+id).trigger('openModal');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXEFwcERhdGFcXFJvYW1pbmdcXG5wbVxcbm9kZV9tb2R1bGVzXFx3YXRjaGlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2JhY2tlbmQtaW50ZXJmYWNlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL21hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJyk7XHJcbmJpID0gcmVxdWlyZSgnLi9iYWNrZW5kLWludGVyZmFjZS5qcycpO1xyXG5tYXAgPSByZXF1aXJlKCcuL21hcC5qcycpXHJcbm1hcC5pbml0KCk7XHJcblxyXG5mdW5jdGlvbiBnZXRRdWFkcmFudChudW0sIHJvd3MsIGNvbHMsIHBvcykge1xyXG4gIGlmIChyb3dzID09PSAxIHx8IGNvbHMgPT09IDEpIHJldHVybiBwb3M7XHJcblxyXG4gIHZhciByb3cgPSBNYXRoLmZsb29yKG51bSAvIHJvd3MpO1xyXG4gIHZhciBjb2wgPSBudW0gJSBjb2xzO1xyXG5cclxuICBzdWJSb3dzID0gcm93cy8yO1xyXG4gIHN1YkNvbHMgPSBjb2xzLzI7XHJcblxyXG4gIHZhciBxdWFkID0gKGNvbCA8IHN1YkNvbHMgPyAwIDogMSkgKyAocm93IDwgc3ViUm93cyA/IDAgOiAyKTtcclxuICBudW0gPSBjb2wgLSAoY29sID49IHN1YkNvbHMgPyBzdWJDb2xzIDogMCkgKyBzdWJSb3dzICogKHJvdyAlIHN1YlJvd3MpO1xyXG5cclxuICByZXR1cm4gZ2V0UXVhZHJhbnQobnVtLCBzdWJSb3dzLCBzdWJDb2xzLCBwb3MgKz0gcXVhZC50b1N0cmluZygpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlTW9kYWwoaWQpIHtcclxuICB2YXIgcm93O1xyXG4gIHZhciBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIG1vZGFsLmlkID0gaWQ7XHJcbiAgbW9kYWwuY2xhc3NOYW1lID0gJ21vZGFsJztcclxuXHJcbiAgZm9yICh2YXIgaiA9IDA7IGogPCA2NDsgaisrKSB7XHJcbiAgICBpZiAoaiAlIDggPT09IDApIHtcclxuICAgICAgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7IFxyXG4gICAgICByb3cuY2xhc3NOYW1lID0gJ21vZGFsUm93J1xyXG4gICAgICBtb2RhbC5hcHBlbmRDaGlsZChyb3cpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBtb2RhbEltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgbW9kYWxJbWcuc3JjID0gXCJodHRwOi8vZWNuLnQxLnRpbGVzLnZpcnR1YWxlYXJ0aC5uZXQvdGlsZXMvaHMwXCIgKyBpZCArIGdldFF1YWRyYW50KGosIDgsIDgsICcnKSArXCIuanBnP2c9Mjk4MSZuPXpcIlxyXG4gICAgcm93LmFwcGVuZENoaWxkKG1vZGFsSW1nKTtcclxuICB9XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKG1vZGFsLCBkb2N1bWVudC5ib2R5LmNoaWxkTm9kZXNbMF0pO1xyXG4gICQoJyMnICsgaWQpLmVhc3lNb2RhbCh7XHJcbiAgICBsZWZ0OiBwYXJzZUludCgkKCcjbWFpbicpLmNzcygnbGVmdCcpKSxcclxuICAgIHRvcDogMFxyXG4gIH0pO1xyXG4gICQoJyMnICsgaWQpLnRyaWdnZXIoJ29wZW5Nb2RhbCcpO1xyXG59XHJcblxyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gIC8vIE9iamVjdCBmb3Igc3RvcmluZyBkZXRlY3Rpb25zXHJcbiAgLy8gU2hvdWxkIG1hcCBjdWJlX2lkIHRvIGFycmF5cyBvZiBkZXRlY3Rpb25zXHJcbiAgdmFyIGRldGVjdGlvbnMgPSB7fVxyXG5cclxuICB2YXIgdHlwZSA9ICdmYWNlcyc7XHJcblxyXG4gIHZhciBkYXRhID0gbWFwLmdldE5TRVcoKTtcclxuICBkYXRhWyd0eXBlJ10gPSB0eXBlO1xyXG4gIC8vc2VuZCBzdHVmZiB0byB0aGUgYmFja2VuZFxyXG4gIGJpLnNlbmQoZGF0YSxmdW5jdGlvbihkZXRlY3Rpb24pe1xyXG4gICAgdmFyIGJhc2U0X2lkX3N0cmluZyA9IGRldGVjdGlvbi5jdWJlX2lkLnRvU3RyaW5nKDQpO1xyXG5cclxuICBcdGlmIChkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXSA9PSBudWxsKSB7XHJcbiAgXHRcdGRldGVjdGlvbnNbZGV0ZWN0aW9uLmN1YmVfaWRdID0gW107XHJcbiAgXHRcdHZhciBtYXJrZXIgPSBtYXAuYWRkTWFya2VyKGRldGVjdGlvbi5jdWJlX2lkLGRldGVjdGlvbi5sYXQsZGV0ZWN0aW9uLmxvbik7XHJcblxyXG5cdFx0XHR2YXIgcG9wdXAgPSBtYXJrZXIuYmluZFBvcHVwKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb250ZW50ID0gJzxkaXYgY2xhc3M9XCJpbWdfcG9wdXBcIj4nXHJcbiAgICAgICAgZGV0ZWN0aW9uc1tkZXRlY3Rpb24uY3ViZV9pZF0uZm9yRWFjaChmdW5jdGlvbihkKXtcclxuICAgICAgICAgIHZhciB3ID0gZC5kZXRlY3RfY29vcmRzLnhfbWF4IC0gZC5kZXRlY3RfY29vcmRzLnhfbWluO1xyXG4gICAgICAgICAgLy8gdmFyIHcgPSA1MDtcclxuICAgICAgICAgIHZhciBoID0gZC5kZXRlY3RfY29vcmRzLnlfbWF4IC0gZC5kZXRlY3RfY29vcmRzLnlfbWluO1xyXG4gICAgICAgICAgdmFyIHRvcCA9IGQuZGV0ZWN0X2Nvb3Jkcy55X21pbjtcclxuICAgICAgICAgIHZhciBsZWZ0ID0gZC5kZXRlY3RfY29vcmRzLnhfbWluO1xyXG5cclxuICAgICAgICAgIHZhciBlbmRfdyA9IDUwOyAvLyBTaXplIG9mIHRoZSBkaXNwbGF5ZWQgZGV0ZWN0aW9uXHJcbiAgICAgICAgICB2YXIgc2NhbGUgPSBlbmRfdy93OyAvLyBIb3cgbXVjaCB0byBzY2FsZSB0aGUgaW1hZ2UgYnkgdG8gZ2V0IHRoZSBwcm9wZXIgZW5kLXNpemVcclxuXHJcbiAgICAgICAgICB2YXIgaW5saW5lX2NzcyA9ICd3aWR0aDogJyArIHcgKiBzY2FsZSArICc7JztcclxuICAgICAgICAgIGlubGluZV9jc3MgKz0gJ2hlaWdodDogJyArIGggKiBzY2FsZSArICc7JztcclxuICAgICAgICAgIGlubGluZV9jc3MgKz0gJ2JhY2tncm91bmQ6IHVybCgnICsgZC51cmwgKyAnKSAnICsgbGVmdCArICcgJyArIHRvcCArICc7J1xyXG4gICAgICAgICAgaW5saW5lX2NzcyArPSAnYmFja2dyb3VuZC1zaXplOiAnICsgMjU2ICogc2NhbGUgKyAncHg7J1xyXG4gICAgICAgICAgY29udGVudCArPSAnPGRpdiBjbGFzcz1cInBvcHVwSW1hZ2VcIiBzdHlsZT1cIicgKyBpbmxpbmVfY3NzICsgJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnRlbnQgKz0gJzwvZGl2PidcclxuICAgICAgICByZXR1cm4gY29udGVudDtcclxuICAgICAgfSkuZ2V0UG9wdXAoKTtcclxuXHJcbiAgICAgIHBvcHVwLm9uKCdjb250ZW50dXBkYXRlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGltZ3MgPSB0aGlzLl9jb250ZW50Tm9kZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwb3B1cEltYWdlJyk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpbWdzW2ldLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHVybCA9IHRoaXMuc3R5bGUuYmFja2dyb3VuZEltYWdlO1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gdXJsLnNsaWNlKHVybC5pbmRleE9mKCcuanBnJykgLSA1LCB1cmwuaW5kZXhPZignLmpwZycpIC0gMyk7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IGJhc2U0X2lkX3N0cmluZyArIGRpcmVjdGlvbjtcclxuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkpIHtcclxuICAgICAgICAgICAgICBjcmVhdGVNb2RhbChpZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgJCgnIycraWQpLnRyaWdnZXIoJ29wZW5Nb2RhbCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcblxyXG4gIFx0fVxyXG4gIFx0ZGV0ZWN0aW9uc1tkZXRlY3Rpb24uY3ViZV9pZF0ucHVzaChkZXRlY3Rpb24pXHJcblxyXG5cclxuICB9KTtcclxufVxyXG4iLCJtYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xyXG52YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcclxuZnVuY3Rpb24gc2VuZChkYXRhLGNiKSB7XHJcblx0Ly8gYm91bmRpbmdCb3ggc2hvdWxkIGJlIGFuIG9iamVjdCBsaWtlIHt0b3A6IDx0b3A+LCBib3R0b206IDxib3R0b20+LCBsZWZ0OiA8bGVmdD4sIHJpZ2h0OiA8cmlnaHQ+fVxyXG5cclxuXHRzb2NrZXQub24oJ3JlY2VpdmVEZXRlY3Rpb24nLCBjYik7XHJcblx0Ly8gVE9ETzogc2VuZCBsYXQvbG9uIHRvIGJhY2tlbmRcclxuXHQvLyBUT0RPOiByZWNpZXZlIGRhdGEgYW5kL29yIGltYWdlcyBmcm9tIGJhY2tlbmRcclxuXHQvL2NvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGJvdW5kaW5nQm94KSk7XHJcblx0c29ja2V0LmVtaXQoJ2dldERldGVjdGlvbicsIGRhdGEpO1xyXG59XHJcblxyXG5leHBvcnRzLnNlbmQgPSBzZW5kO1xyXG4iLCJ2YXIgbWFwO1xyXG52YXIgbG9jYXRpb25GaWx0ZXI7XHJcbnZhciBtYXJrZXJzO1xyXG5cclxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0bWFwID0gTC5tYXAoJ215TWFwJyx7bWF4Wm9vbTogMjJ9KS5zZXRWaWV3KFs0MC4wMTgsLTEwNS4yNzU1XSwgMTgpO1xyXG5cdC8vIExheWVyc1xyXG5cdHZhciBvc20gPSBuZXcgTC5UaWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vcGVuc3RyZWV0bWFwLm9yZy97en0ve3h9L3t5fS5wbmcnLFxyXG5cdFx0e21heE5hdGl2ZVpvb206IDE5LCBtYXhab29tOiAyMn0pO1xyXG5cdHZhciBiaW5nID0gbmV3IEwuQmluZ0xheWVyKFwiQW8wcGdLSmlFelZFV0tDQ2hIVEI1SkJlelc5WHZvTTRXRVNwZVl5d3o4d0JZOWtrV3JaV05kS0JabW1xejIxWVwiLFxyXG5cdFx0e21heE5hdGl2ZVpvb206IDE5LCBtYXhab29tOiAyMn0pO1xyXG5cdG1hcC5hZGRMYXllcihiaW5nKTtcclxuXHRtYXAuYWRkQ29udHJvbChuZXcgTC5Db250cm9sLkxheWVycyh7J09TTSc6b3NtLCBcIkJpbmdcIjpiaW5nfSwge30pKTtcclxuXHJcblx0bWFya2VycyA9IG5ldyBMLk1hcmtlckNsdXN0ZXJHcm91cCgpO1xyXG5cdG1hcC5hZGRMYXllcihtYXJrZXJzKTtcclxuXHJcblx0Ly8gQWRkIGEgYm91bmRpbmcgYm94IHNlbGVjdG9yIHRvIHRoZSBtYXBcclxuXHRsb2NhdGlvbkZpbHRlciA9IG5ldyBMLkxvY2F0aW9uRmlsdGVyKHtcclxuXHRcdGJvdW5kczogTC5MYXRMbmdCb3VuZHMoW1s0MC4wMTg3MTgsIC0xMDUuMjc2MDYxXSxbNDAuMDE3OTc4LCAtMTA1LjI3NDQ0MV1dKSxcclxuXHRcdGVuYWJsZTogdHJ1ZX0pO1xyXG5cdGxvY2F0aW9uRmlsdGVyLmFkZFRvKG1hcCk7XHJcbn1cclxuZXhwb3J0cy5hZGRNYXJrZXIgPSBmdW5jdGlvbihjdWJlX2lkLGxhdCxsb24pIHtcclxuXHQvL2NvbnNvbGUubG9nKGRldGVjdGlvbik7XHJcblx0dmFyIG1hcmtlciA9IEwubWFya2VyKG5ldyBMLkxhdExuZyhsYXQsIGxvbikpO1xyXG5cdG1hcmtlci5iaW5kUG9wdXAoJzxoMT4gZm9vIDwvaDE+Jyk7XHJcblx0bWFya2Vycy5hZGRMYXllcihtYXJrZXIpO1xyXG5cdHJldHVybiBtYXJrZXI7XHJcbn1cclxuZXhwb3J0cy5nZXROU0VXID0gZnVuY3Rpb24oKSB7XHJcblx0Ly8gUmVhZCB0aGUgYm91bmRpbmcgYm94XHJcblx0dmFyIGJvdW5kcyA9IGxvY2F0aW9uRmlsdGVyLmdldEJvdW5kcygpO1xyXG5cdHJldHVybiB7IG46IGJvdW5kcy5nZXROb3J0aCgpLCBzOiBib3VuZHMuZ2V0U291dGgoKSwgZTogYm91bmRzLmdldEVhc3QoKSwgdzogYm91bmRzLmdldFdlc3QoKSB9XHJcbn0iXX0=
