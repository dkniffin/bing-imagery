(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/rgreen/bing-imagery/public/javascripts/app.js":[function(require,module,exports){
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
          content += '<img src=' + d.url + '/>';
        });

        content += '</div>'
        return content;

      });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2JhY2tlbmQtaW50ZXJmYWNlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL21hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJyk7XG5iaSA9IHJlcXVpcmUoJy4vYmFja2VuZC1pbnRlcmZhY2UuanMnKTtcbm1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJylcbm1hcC5pbml0KCk7XG5cbi8vIHZhciBtYXAgPSBuZXcgTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlNYXBcIiksIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MCwgLTEwNS4yNyksIDE1KTtcblxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8gT2JqZWN0IGZvciBzdG9yaW5nIGRldGVjdGlvbnNcbiAgLy8gU2hvdWxkIG1hcCBjdWJlX2lkIHRvIGFycmF5cyBvZiBkZXRlY3Rpb25zXG4gIHZhciBkZXRlY3Rpb25zID0ge31cbiAgLy9zZW5kIHN0dWZmIHRvIHRoZSBiYWNrZW5kXG4gIGJpLnNlbmQobWFwLmdldE5TRVcoKSxmdW5jdGlvbihkZXRlY3Rpb24pe1xuICBcdGlmIChkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXSA9PSBudWxsKSB7XG4gIFx0XHRkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXSA9IFtdO1xuICBcdFx0dmFyIG1hcmtlciA9IG1hcC5hZGRNYXJrZXIoZGV0ZWN0aW9uLmN1YmVfaWQsZGV0ZWN0aW9uLmxhdCxkZXRlY3Rpb24ubG9uKVxuXG5cdFx0XHRtYXJrZXIuYmluZFBvcHVwKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29udGVudCA9ICc8ZGl2IGNsYXNzPVwiaW1nX3BvcHVwXCI+J1xuICAgICAgICBkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXS5mb3JFYWNoKGZ1bmN0aW9uKGQpe1xuICAgICAgICAgIGNvbnRlbnQgKz0gJzxpbWcgc3JjPScgKyBkLnVybCArICcvPic7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRlbnQgKz0gJzwvZGl2PidcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG5cbiAgICAgIH0pO1xuICBcdH1cbiAgXHRkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXS5wdXNoKGRldGVjdGlvbilcblxuXG4gIH0pO1xufSIsIm1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJyk7XG52YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcbmZ1bmN0aW9uIHNlbmQoYm91bmRpbmdCb3gsY2IpIHtcblx0Ly8gYm91bmRpbmdCb3ggc2hvdWxkIGJlIGFuIG9iamVjdCBsaWtlIHt0b3A6IDx0b3A+LCBib3R0b206IDxib3R0b20+LCBsZWZ0OiA8bGVmdD4sIHJpZ2h0OiA8cmlnaHQ+fVxuXG5cdHNvY2tldC5vbigncmVjZWl2ZURldGVjdGlvbicsIGNiKTtcblx0Ly8gVE9ETzogc2VuZCBsYXQvbG9uIHRvIGJhY2tlbmRcblx0Ly8gVE9ETzogcmVjaWV2ZSBkYXRhIGFuZC9vciBpbWFnZXMgZnJvbSBiYWNrZW5kXG5cdC8vY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoYm91bmRpbmdCb3gpKTtcblx0c29ja2V0LmVtaXQoJ2dldERldGVjdGlvbicsIGJvdW5kaW5nQm94KTtcbn1cblxuZXhwb3J0cy5zZW5kID0gc2VuZDsiLCJ2YXIgbWFwO1xudmFyIGxvY2F0aW9uRmlsdGVyO1xudmFyIG1hcmtlcnM7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRtYXAgPSBMLm1hcCgnbXlNYXAnLHttYXhab29tOiAyMn0pLnNldFZpZXcoWzQwLjAxOCwtMTA1LjI3NTVdLCAxOCk7XG5cdC8vIExheWVyc1xuXHR2YXIgb3NtID0gbmV3IEwuVGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGUub3BlbnN0cmVldG1hcC5vcmcve3p9L3t4fS97eX0ucG5nJyxcblx0XHR7bWF4TmF0aXZlWm9vbTogMTksIG1heFpvb206IDIyfSk7XG5cdHZhciBiaW5nID0gbmV3IEwuQmluZ0xheWVyKFwiQW8wcGdLSmlFelZFV0tDQ2hIVEI1SkJlelc5WHZvTTRXRVNwZVl5d3o4d0JZOWtrV3JaV05kS0JabW1xejIxWVwiLFxuXHRcdHttYXhOYXRpdmVab29tOiAxOSwgbWF4Wm9vbTogMjJ9KTtcblx0bWFwLmFkZExheWVyKGJpbmcpO1xuXHRtYXAuYWRkQ29udHJvbChuZXcgTC5Db250cm9sLkxheWVycyh7J09TTSc6b3NtLCBcIkJpbmdcIjpiaW5nfSwge30pKTtcblxuXHRtYXJrZXJzID0gbmV3IEwuTWFya2VyQ2x1c3Rlckdyb3VwKCk7XG5cdG1hcC5hZGRMYXllcihtYXJrZXJzKTtcblxuXHQvLyBBZGQgYSBib3VuZGluZyBib3ggc2VsZWN0b3IgdG8gdGhlIG1hcFxuXHRsb2NhdGlvbkZpbHRlciA9IG5ldyBMLkxvY2F0aW9uRmlsdGVyKHtcblx0XHRib3VuZHM6IEwuTGF0TG5nQm91bmRzKFtbNDAuMDE4NzE4LCAtMTA1LjI3NjA2MV0sWzQwLjAxNzk3OCwgLTEwNS4yNzQ0NDFdXSksXG5cdFx0ZW5hYmxlOiB0cnVlfSk7XG5cdGxvY2F0aW9uRmlsdGVyLmFkZFRvKG1hcCk7XG59XG5leHBvcnRzLmFkZE1hcmtlciA9IGZ1bmN0aW9uKGN1YmVfaWQsbGF0LGxvbikge1xuXHQvL2NvbnNvbGUubG9nKGRldGVjdGlvbik7XG5cdHZhciBtYXJrZXIgPSBMLm1hcmtlcihuZXcgTC5MYXRMbmcobGF0LCBsb24pKTtcblx0bWFya2VyLmJpbmRQb3B1cCgnPGgxPiBmb28gPC9oMT4nKTtcblx0bWFya2Vycy5hZGRMYXllcihtYXJrZXIpO1xuXHRyZXR1cm4gbWFya2VyO1xufVxuZXhwb3J0cy5nZXROU0VXID0gZnVuY3Rpb24oKSB7XG5cdC8vIFJlYWQgdGhlIGJvdW5kaW5nIGJveFxuXHR2YXIgYm91bmRzID0gbG9jYXRpb25GaWx0ZXIuZ2V0Qm91bmRzKCk7XG5cdHJldHVybiB7IG46IGJvdW5kcy5nZXROb3J0aCgpLCBzOiBib3VuZHMuZ2V0U291dGgoKSwgZTogYm91bmRzLmdldEVhc3QoKSwgdzogYm91bmRzLmdldFdlc3QoKSB9XG59Il19
