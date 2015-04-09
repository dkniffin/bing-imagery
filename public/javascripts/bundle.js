(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/rgreen/bing-imagery/public/javascripts/app.js":[function(require,module,exports){
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

},{"./backend-interface.js":"/Users/rgreen/bing-imagery/public/javascripts/backend-interface.js","./map.js":"/Users/rgreen/bing-imagery/public/javascripts/map.js"}],"/Users/rgreen/bing-imagery/public/javascripts/backend-interface.js":[function(require,module,exports){
map = require('./map.js');
var socket = io('http://localhost');
function send(boundingBox,cb) {
	// boundingBox should be an object like {top: <top>, bottom: <bottom>, left: <left>, right: <right>}

	socket.on('receiveDetection', cb);
	// TODO: send lat/lon to backend
	// TODO: recieve data and/or images from backend
	//console.log(JSON.stringify(boundingBox));
	socket.emit('getDetection', boundingBox);
}

exports.send = send;
},{"./map.js":"/Users/rgreen/bing-imagery/public/javascripts/map.js"}],"/Users/rgreen/bing-imagery/public/javascripts/map.js":[function(require,module,exports){
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
},{}]},{},["/Users/rgreen/bing-imagery/public/javascripts/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2JhY2tlbmQtaW50ZXJmYWNlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL21hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJyk7XG5iaSA9IHJlcXVpcmUoJy4vYmFja2VuZC1pbnRlcmZhY2UuanMnKTtcbm1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJylcbm1hcC5pbml0KCk7XG5cbmZ1bmN0aW9uIGdldFF1YWRyYW50KG51bSwgcm93cywgY29scywgcG9zKSB7XG4gIGlmIChyb3dzID09PSAxIHx8IGNvbHMgPT09IDEpIHJldHVybiBwb3M7XG5cbiAgdmFyIHJvdyA9IE1hdGguZmxvb3IobnVtIC8gcm93cyk7XG4gIHZhciBjb2wgPSBudW0gJSBjb2xzO1xuXG4gIHN1YlJvd3MgPSByb3dzLzI7XG4gIHN1YkNvbHMgPSBjb2xzLzI7XG5cbiAgdmFyIHF1YWQgPSAoY29sIDwgc3ViQ29scyA/IDAgOiAxKSArIChyb3cgPCBzdWJSb3dzID8gMCA6IDIpO1xuICBudW0gPSBjb2wgLSAoY29sID49IHN1YkNvbHMgPyBzdWJDb2xzIDogMCkgKyBzdWJSb3dzICogKHJvdyAlIHN1YlJvd3MpO1xuXG4gIHJldHVybiBnZXRRdWFkcmFudChudW0sIHN1YlJvd3MsIHN1YkNvbHMsIHBvcyArPSBxdWFkLnRvU3RyaW5nKCkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNb2RhbChpZCkge1xuICB2YXIgcm93O1xuICB2YXIgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgbW9kYWwuaWQgPSBpZDtcbiAgbW9kYWwuY2xhc3NOYW1lID0gJ21vZGFsJztcblxuICBmb3IgKHZhciBqID0gMDsgaiA8IDY0OyBqKyspIHtcbiAgICBpZiAoaiAlIDggPT09IDApIHtcbiAgICAgIHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOyBcbiAgICAgIHJvdy5jbGFzc05hbWUgPSAnbW9kYWxSb3cnXG4gICAgICBtb2RhbC5hcHBlbmRDaGlsZChyb3cpO1xuICAgIH1cblxuICAgIHZhciBtb2RhbEltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgIG1vZGFsSW1nLnNyYyA9IFwiaHR0cDovL2Vjbi50MS50aWxlcy52aXJ0dWFsZWFydGgubmV0L3RpbGVzL2hzMFwiICsgaWQgKyBnZXRRdWFkcmFudChqLCA4LCA4LCAnJykgK1wiLmpwZz9nPTI5ODEmbj16XCJcbiAgICByb3cuYXBwZW5kQ2hpbGQobW9kYWxJbWcpO1xuICB9XG5cbiAgZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUobW9kYWwsIGRvY3VtZW50LmJvZHkuY2hpbGROb2Rlc1swXSk7XG4gICQoJyMnICsgaWQpLmVhc3lNb2RhbCh7XG4gICAgbGVmdDogcGFyc2VJbnQoJCgnI21haW4nKS5jc3MoJ2xlZnQnKSksXG4gICAgdG9wOiAwXG4gIH0pO1xuICAkKCcjJyArIGlkKS50cmlnZ2VyKCdvcGVuTW9kYWwnKTtcbn1cblxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcblxuICAvLyBPYmplY3QgZm9yIHN0b3JpbmcgZGV0ZWN0aW9uc1xuICAvLyBTaG91bGQgbWFwIGN1YmVfaWQgdG8gYXJyYXlzIG9mIGRldGVjdGlvbnNcbiAgdmFyIGRldGVjdGlvbnMgPSB7fVxuICAvL3NlbmQgc3R1ZmYgdG8gdGhlIGJhY2tlbmRcbiAgYmkuc2VuZChtYXAuZ2V0TlNFVygpLGZ1bmN0aW9uKGRldGVjdGlvbil7XG4gICAgdmFyIGJhc2U0X2lkX3N0cmluZyA9IGRldGVjdGlvbi5jdWJlX2lkLnRvU3RyaW5nKDQpO1xuXG4gIFx0aWYgKGRldGVjdGlvbnNbZGV0ZWN0aW9uLmN1YmVfaWRdID09IG51bGwpIHtcbiAgXHRcdGRldGVjdGlvbnNbZGV0ZWN0aW9uLmN1YmVfaWRdID0gW107XG4gIFx0XHR2YXIgbWFya2VyID0gbWFwLmFkZE1hcmtlcihkZXRlY3Rpb24uY3ViZV9pZCxkZXRlY3Rpb24ubGF0LGRldGVjdGlvbi5sb24pO1xuXG5cdFx0XHR2YXIgcG9wdXAgPSBtYXJrZXIuYmluZFBvcHVwKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29udGVudCA9ICc8ZGl2IGNsYXNzPVwiaW1nX3BvcHVwXCI+J1xuICAgICAgICBkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXS5mb3JFYWNoKGZ1bmN0aW9uKGQpe1xuICAgICAgICAgIHZhciB3ID0gZC5kZXRlY3RfY29vcmRzLnhfbWF4IC0gZC5kZXRlY3RfY29vcmRzLnhfbWluO1xuICAgICAgICAgIC8vIHZhciB3ID0gNTA7XG4gICAgICAgICAgdmFyIGggPSBkLmRldGVjdF9jb29yZHMueV9tYXggLSBkLmRldGVjdF9jb29yZHMueV9taW47XG4gICAgICAgICAgdmFyIHRvcCA9IGQuZGV0ZWN0X2Nvb3Jkcy55X21pbjtcbiAgICAgICAgICB2YXIgbGVmdCA9IGQuZGV0ZWN0X2Nvb3Jkcy54X21pbjtcblxuICAgICAgICAgIHZhciBlbmRfdyA9IDUwOyAvLyBTaXplIG9mIHRoZSBkaXNwbGF5ZWQgZGV0ZWN0aW9uXG4gICAgICAgICAgdmFyIHNjYWxlID0gZW5kX3cvdzsgLy8gSG93IG11Y2ggdG8gc2NhbGUgdGhlIGltYWdlIGJ5IHRvIGdldCB0aGUgcHJvcGVyIGVuZC1zaXplXG5cbiAgICAgICAgICB2YXIgaW5saW5lX2NzcyA9ICd3aWR0aDogJyArIHcgKiBzY2FsZSArICc7JztcbiAgICAgICAgICBpbmxpbmVfY3NzICs9ICdoZWlnaHQ6ICcgKyBoICogc2NhbGUgKyAnOyc7XG4gICAgICAgICAgaW5saW5lX2NzcyArPSAnYmFja2dyb3VuZDogdXJsKCcgKyBkLnVybCArICcpICcgKyBsZWZ0ICsgJyAnICsgdG9wICsgJzsnXG4gICAgICAgICAgaW5saW5lX2NzcyArPSAnYmFja2dyb3VuZC1zaXplOiAnICsgMjU2ICogc2NhbGUgKyAncHg7J1xuICAgICAgICAgIGNvbnRlbnQgKz0gJzxkaXYgY2xhc3M9XCJwb3B1cEltYWdlXCIgc3R5bGU9XCInICsgaW5saW5lX2NzcyArICdcIj48L2Rpdj4nO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb250ZW50ICs9ICc8L2Rpdj4nXG4gICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgfSkuZ2V0UG9wdXAoKTtcblxuICAgICAgcG9wdXAub24oJ2NvbnRlbnR1cGRhdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGltZ3MgPSB0aGlzLl9jb250ZW50Tm9kZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwb3B1cEltYWdlJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGltZ3NbaV0ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHVybCA9IHRoaXMuc3R5bGUuYmFja2dyb3VuZEltYWdlO1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHVybC5zbGljZSh1cmwuaW5kZXhPZignLmpwZycpIC0gNSwgdXJsLmluZGV4T2YoJy5qcGcnKSAtIDMpO1xuICAgICAgICAgICAgdmFyIGlkID0gYmFzZTRfaWRfc3RyaW5nICsgZGlyZWN0aW9uO1xuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkpIHtcbiAgICAgICAgICAgICAgY3JlYXRlTW9kYWwoaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICQoJyMnK2lkKS50cmlnZ2VyKCdvcGVuTW9kYWwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgfSlcblxuXG4gIFx0fVxuICBcdGRldGVjdGlvbnNbZGV0ZWN0aW9uLmN1YmVfaWRdLnB1c2goZGV0ZWN0aW9uKVxuXG5cbiAgfSk7XG59XG4iLCJtYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xudmFyIHNvY2tldCA9IGlvKCdodHRwOi8vbG9jYWxob3N0Jyk7XG5mdW5jdGlvbiBzZW5kKGJvdW5kaW5nQm94LGNiKSB7XG5cdC8vIGJvdW5kaW5nQm94IHNob3VsZCBiZSBhbiBvYmplY3QgbGlrZSB7dG9wOiA8dG9wPiwgYm90dG9tOiA8Ym90dG9tPiwgbGVmdDogPGxlZnQ+LCByaWdodDogPHJpZ2h0Pn1cblxuXHRzb2NrZXQub24oJ3JlY2VpdmVEZXRlY3Rpb24nLCBjYik7XG5cdC8vIFRPRE86IHNlbmQgbGF0L2xvbiB0byBiYWNrZW5kXG5cdC8vIFRPRE86IHJlY2lldmUgZGF0YSBhbmQvb3IgaW1hZ2VzIGZyb20gYmFja2VuZFxuXHQvL2NvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGJvdW5kaW5nQm94KSk7XG5cdHNvY2tldC5lbWl0KCdnZXREZXRlY3Rpb24nLCBib3VuZGluZ0JveCk7XG59XG5cbmV4cG9ydHMuc2VuZCA9IHNlbmQ7IiwidmFyIG1hcDtcbnZhciBsb2NhdGlvbkZpbHRlcjtcbnZhciBtYXJrZXJzO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0bWFwID0gTC5tYXAoJ215TWFwJyx7bWF4Wm9vbTogMjJ9KS5zZXRWaWV3KFs0MC4wMTgsLTEwNS4yNzU1XSwgMTgpO1xuXHQvLyBMYXllcnNcblx0dmFyIG9zbSA9IG5ldyBMLlRpbGVMYXllcignaHR0cDovL3tzfS50aWxlLm9wZW5zdHJlZXRtYXAub3JnL3t6fS97eH0ve3l9LnBuZycsXG5cdFx0e21heE5hdGl2ZVpvb206IDE5LCBtYXhab29tOiAyMn0pO1xuXHR2YXIgYmluZyA9IG5ldyBMLkJpbmdMYXllcihcIkFvMHBnS0ppRXpWRVdLQ0NoSFRCNUpCZXpXOVh2b000V0VTcGVZeXd6OHdCWTlra1dyWldOZEtCWm1tcXoyMVlcIixcblx0XHR7bWF4TmF0aXZlWm9vbTogMTksIG1heFpvb206IDIyfSk7XG5cdG1hcC5hZGRMYXllcihiaW5nKTtcblx0bWFwLmFkZENvbnRyb2wobmV3IEwuQ29udHJvbC5MYXllcnMoeydPU00nOm9zbSwgXCJCaW5nXCI6YmluZ30sIHt9KSk7XG5cblx0bWFya2VycyA9IG5ldyBMLk1hcmtlckNsdXN0ZXJHcm91cCgpO1xuXHRtYXAuYWRkTGF5ZXIobWFya2Vycyk7XG5cblx0Ly8gQWRkIGEgYm91bmRpbmcgYm94IHNlbGVjdG9yIHRvIHRoZSBtYXBcblx0bG9jYXRpb25GaWx0ZXIgPSBuZXcgTC5Mb2NhdGlvbkZpbHRlcih7XG5cdFx0Ym91bmRzOiBMLkxhdExuZ0JvdW5kcyhbWzQwLjAxODcxOCwgLTEwNS4yNzYwNjFdLFs0MC4wMTc5NzgsIC0xMDUuMjc0NDQxXV0pLFxuXHRcdGVuYWJsZTogdHJ1ZX0pO1xuXHRsb2NhdGlvbkZpbHRlci5hZGRUbyhtYXApO1xufVxuZXhwb3J0cy5hZGRNYXJrZXIgPSBmdW5jdGlvbihjdWJlX2lkLGxhdCxsb24pIHtcblx0Ly9jb25zb2xlLmxvZyhkZXRlY3Rpb24pO1xuXHR2YXIgbWFya2VyID0gTC5tYXJrZXIobmV3IEwuTGF0TG5nKGxhdCwgbG9uKSk7XG5cdG1hcmtlci5iaW5kUG9wdXAoJzxoMT4gZm9vIDwvaDE+Jyk7XG5cdG1hcmtlcnMuYWRkTGF5ZXIobWFya2VyKTtcblx0cmV0dXJuIG1hcmtlcjtcbn1cbmV4cG9ydHMuZ2V0TlNFVyA9IGZ1bmN0aW9uKCkge1xuXHQvLyBSZWFkIHRoZSBib3VuZGluZyBib3hcblx0dmFyIGJvdW5kcyA9IGxvY2F0aW9uRmlsdGVyLmdldEJvdW5kcygpO1xuXHRyZXR1cm4geyBuOiBib3VuZHMuZ2V0Tm9ydGgoKSwgczogYm91bmRzLmdldFNvdXRoKCksIGU6IGJvdW5kcy5nZXRFYXN0KCksIHc6IGJvdW5kcy5nZXRXZXN0KCkgfVxufSJdfQ==
