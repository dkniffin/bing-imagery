(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\app.js":[function(require,module,exports){
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

},{"./backend-interface.js":"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\backend-interface.js","./map.js":"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\map.js"}],"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\backend-interface.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXEFwcERhdGFcXFJvYW1pbmdcXG5wbVxcbm9kZV9tb2R1bGVzXFx3YXRjaGlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2JhY2tlbmQtaW50ZXJmYWNlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL21hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gTWFwID0gcmVxdWlyZSgnLi9tYXAuanMnKTtcclxuYmkgPSByZXF1aXJlKCcuL2JhY2tlbmQtaW50ZXJmYWNlLmpzJyk7XHJcbm1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJylcclxubWFwLmluaXQoKTtcclxuXHJcbi8vIHZhciBtYXAgPSBuZXcgTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlNYXBcIiksIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MCwgLTEwNS4yNyksIDE1KTtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAvLyBPYmplY3QgZm9yIHN0b3JpbmcgZGV0ZWN0aW9uc1xyXG4gIC8vIFNob3VsZCBtYXAgY3ViZV9pZCB0byBhcnJheXMgb2YgZGV0ZWN0aW9uc1xyXG4gIHZhciBkZXRlY3Rpb25zID0ge31cclxuICAvL3NlbmQgc3R1ZmYgdG8gdGhlIGJhY2tlbmRcclxuICBiaS5zZW5kKG1hcC5nZXROU0VXKCksZnVuY3Rpb24oZGV0ZWN0aW9uKXtcclxuICBcdGlmIChkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXSA9PSBudWxsKSB7XHJcbiAgXHRcdGRldGVjdGlvbnNbZGV0ZWN0aW9uLmN1YmVfaWRdID0gW107XHJcbiAgXHRcdHZhciBtYXJrZXIgPSBtYXAuYWRkTWFya2VyKGRldGVjdGlvbi5jdWJlX2lkLGRldGVjdGlvbi5sYXQsZGV0ZWN0aW9uLmxvbilcclxuXHJcblx0XHRcdG1hcmtlci5iaW5kUG9wdXAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbnRlbnQgPSAnPGRpdiBjbGFzcz1cImltZ19wb3B1cFwiPidcclxuICAgICAgICBkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXS5mb3JFYWNoKGZ1bmN0aW9uKGQpe1xyXG4gICAgICAgICAgdmFyIHcgPSBkLmRldGVjdF9jb29yZHMueF9tYXggLSBkLmRldGVjdF9jb29yZHMueF9taW47XHJcbiAgICAgICAgICAvLyB2YXIgdyA9IDUwO1xyXG4gICAgICAgICAgdmFyIGggPSBkLmRldGVjdF9jb29yZHMueV9tYXggLSBkLmRldGVjdF9jb29yZHMueV9taW47XHJcbiAgICAgICAgICB2YXIgdG9wID0gZC5kZXRlY3RfY29vcmRzLnlfbWluO1xyXG4gICAgICAgICAgdmFyIGxlZnQgPSBkLmRldGVjdF9jb29yZHMueF9taW47XHJcblxyXG4gICAgICAgICAgdmFyIGVuZF93ID0gNTA7IC8vIFNpemUgb2YgdGhlIGRpc3BsYXllZCBkZXRlY3Rpb25cclxuICAgICAgICAgIHZhciBzY2FsZSA9IGVuZF93L3c7IC8vIEhvdyBtdWNoIHRvIHNjYWxlIHRoZSBpbWFnZSBieSB0byBnZXQgdGhlIHByb3BlciBlbmQtc2l6ZVxyXG5cclxuICAgICAgICAgIHZhciBpbmxpbmVfY3NzID0gJ3dpZHRoOiAnICsgdyAqIHNjYWxlICsgJzsnO1xyXG4gICAgICAgICAgaW5saW5lX2NzcyArPSAnaGVpZ2h0OiAnICsgaCAqIHNjYWxlICsgJzsnO1xyXG4gICAgICAgICAgaW5saW5lX2NzcyArPSAnYmFja2dyb3VuZDogdXJsKCcgKyBkLnVybCArICcpICcgKyBsZWZ0ICsgJyAnICsgdG9wICsgJzsnXHJcbiAgICAgICAgICBpbmxpbmVfY3NzICs9ICdiYWNrZ3JvdW5kLXNpemU6ICcgKyAyNTYgKiBzY2FsZSArICdweDsnXHJcbiAgICAgICAgICBpbmxpbmVfY3NzICs9ICdmbG9hdDogbGVmdDsnO1xyXG4gICAgICAgICAgaW5saW5lX2NzcyArPSAnbWFyZ2luOiAycHg7J1xyXG4gICAgICAgICAgY29udGVudCArPSAnPGRpdiBzdHlsZT1cIicgKyBpbmxpbmVfY3NzICsgJ1wiPjwvZGl2Pic7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnRlbnQgKz0gJzwvZGl2PidcclxuICAgICAgICByZXR1cm4gY29udGVudDtcclxuXHJcbiAgICAgIH0pO1xyXG4gIFx0fVxyXG4gIFx0ZGV0ZWN0aW9uc1tkZXRlY3Rpb24uY3ViZV9pZF0ucHVzaChkZXRlY3Rpb24pXHJcblxyXG5cclxuICB9KTtcclxufVxyXG4iLCJtYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xyXG52YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcclxuZnVuY3Rpb24gc2VuZChib3VuZGluZ0JveCxjYikge1xyXG5cdC8vIGJvdW5kaW5nQm94IHNob3VsZCBiZSBhbiBvYmplY3QgbGlrZSB7dG9wOiA8dG9wPiwgYm90dG9tOiA8Ym90dG9tPiwgbGVmdDogPGxlZnQ+LCByaWdodDogPHJpZ2h0Pn1cclxuXHJcblx0c29ja2V0Lm9uKCdyZWNlaXZlRGV0ZWN0aW9uJywgY2IpO1xyXG5cdC8vIFRPRE86IHNlbmQgbGF0L2xvbiB0byBiYWNrZW5kXHJcblx0Ly8gVE9ETzogcmVjaWV2ZSBkYXRhIGFuZC9vciBpbWFnZXMgZnJvbSBiYWNrZW5kXHJcblx0Ly9jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShib3VuZGluZ0JveCkpO1xyXG5cdHNvY2tldC5lbWl0KCdnZXREZXRlY3Rpb24nLCBib3VuZGluZ0JveCk7XHJcbn1cclxuXHJcbmV4cG9ydHMuc2VuZCA9IHNlbmQ7IiwidmFyIG1hcDtcclxudmFyIGxvY2F0aW9uRmlsdGVyO1xyXG52YXIgbWFya2VycztcclxuXHJcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdG1hcCA9IEwubWFwKCdteU1hcCcse21heFpvb206IDIyfSkuc2V0VmlldyhbNDAuMDE4LC0xMDUuMjc1NV0sIDE4KTtcclxuXHQvLyBMYXllcnNcclxuXHR2YXIgb3NtID0gbmV3IEwuVGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGUub3BlbnN0cmVldG1hcC5vcmcve3p9L3t4fS97eX0ucG5nJyxcclxuXHRcdHttYXhOYXRpdmVab29tOiAxOSwgbWF4Wm9vbTogMjJ9KTtcclxuXHR2YXIgYmluZyA9IG5ldyBMLkJpbmdMYXllcihcIkFvMHBnS0ppRXpWRVdLQ0NoSFRCNUpCZXpXOVh2b000V0VTcGVZeXd6OHdCWTlra1dyWldOZEtCWm1tcXoyMVlcIixcclxuXHRcdHttYXhOYXRpdmVab29tOiAxOSwgbWF4Wm9vbTogMjJ9KTtcclxuXHRtYXAuYWRkTGF5ZXIoYmluZyk7XHJcblx0bWFwLmFkZENvbnRyb2wobmV3IEwuQ29udHJvbC5MYXllcnMoeydPU00nOm9zbSwgXCJCaW5nXCI6YmluZ30sIHt9KSk7XHJcblxyXG5cdG1hcmtlcnMgPSBuZXcgTC5NYXJrZXJDbHVzdGVyR3JvdXAoKTtcclxuXHRtYXAuYWRkTGF5ZXIobWFya2Vycyk7XHJcblxyXG5cdC8vIEFkZCBhIGJvdW5kaW5nIGJveCBzZWxlY3RvciB0byB0aGUgbWFwXHJcblx0bG9jYXRpb25GaWx0ZXIgPSBuZXcgTC5Mb2NhdGlvbkZpbHRlcih7XHJcblx0XHRib3VuZHM6IEwuTGF0TG5nQm91bmRzKFtbNDAuMDE4NzE4LCAtMTA1LjI3NjA2MV0sWzQwLjAxNzk3OCwgLTEwNS4yNzQ0NDFdXSksXHJcblx0XHRlbmFibGU6IHRydWV9KTtcclxuXHRsb2NhdGlvbkZpbHRlci5hZGRUbyhtYXApO1xyXG59XHJcbmV4cG9ydHMuYWRkTWFya2VyID0gZnVuY3Rpb24oY3ViZV9pZCxsYXQsbG9uKSB7XHJcblx0Ly9jb25zb2xlLmxvZyhkZXRlY3Rpb24pO1xyXG5cdHZhciBtYXJrZXIgPSBMLm1hcmtlcihuZXcgTC5MYXRMbmcobGF0LCBsb24pKTtcclxuXHRtYXJrZXIuYmluZFBvcHVwKCc8aDE+IGZvbyA8L2gxPicpO1xyXG5cdG1hcmtlcnMuYWRkTGF5ZXIobWFya2VyKTtcclxuXHRyZXR1cm4gbWFya2VyO1xyXG59XHJcbmV4cG9ydHMuZ2V0TlNFVyA9IGZ1bmN0aW9uKCkge1xyXG5cdC8vIFJlYWQgdGhlIGJvdW5kaW5nIGJveFxyXG5cdHZhciBib3VuZHMgPSBsb2NhdGlvbkZpbHRlci5nZXRCb3VuZHMoKTtcclxuXHRyZXR1cm4geyBuOiBib3VuZHMuZ2V0Tm9ydGgoKSwgczogYm91bmRzLmdldFNvdXRoKCksIGU6IGJvdW5kcy5nZXRFYXN0KCksIHc6IGJvdW5kcy5nZXRXZXN0KCkgfVxyXG59Il19
