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
  		map.addMarker(detection.cube_id,detection.lat,detection.lon)
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
var pruneCluster;

exports.init = function() {
	map = L.map('myMap',{maxZoom: 22}).setView([40.018,-105.2755], 18);
	// Layers
	var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{maxNativeZoom: 19, maxZoom: 22});
	var bing = new L.BingLayer("Ao0pgKJiEzVEWKCChHTB5JBezW9XvoM4WESpeYywz8wBY9kkWrZWNdKBZmmqz21Y",
		{maxNativeZoom: 19, maxZoom: 22});
	map.addLayer(bing);
	map.addControl(new L.Control.Layers({'OSM':osm, "Bing":bing}, {}));

	// Add a bounding box selector to the map
	locationFilter = new L.LocationFilter({
		bounds: L.LatLngBounds([[40.018718, -105.276061],[40.017978, -105.274441]]),
		enable: true});
	locationFilter.addTo(map);

	pruneCluster = new PruneClusterForLeaflet();
	map.addLayer(pruneCluster);
}
exports.addMarker = function(cube_id,lat,lon) {
	//console.log(detection);
	var marker = new PruneCluster.Marker(lat,lon);
	pruneCluster.RegisterMarker(marker);
	pruneCluster.ProcessView();
}
exports.getNSEW = function() {
	// Read the bounding box
	var bounds = locationFilter.getBounds();
	return { n: bounds.getNorth(), s: bounds.getSouth(), e: bounds.getEast(), w: bounds.getWest() }
}
},{}]},{},["C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXEFwcERhdGFcXFJvYW1pbmdcXG5wbVxcbm9kZV9tb2R1bGVzXFx3YXRjaGlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2JhY2tlbmQtaW50ZXJmYWNlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL21hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBNYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xyXG5iaSA9IHJlcXVpcmUoJy4vYmFja2VuZC1pbnRlcmZhY2UuanMnKTtcclxubWFwID0gcmVxdWlyZSgnLi9tYXAuanMnKVxyXG5tYXAuaW5pdCgpO1xyXG5cclxuLy8gdmFyIG1hcCA9IG5ldyBNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJteU1hcFwiKSwgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQwLCAtMTA1LjI3KSwgMTUpO1xyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gIC8vIE9iamVjdCBmb3Igc3RvcmluZyBkZXRlY3Rpb25zXHJcbiAgLy8gU2hvdWxkIG1hcCBjdWJlX2lkIHRvIGFycmF5cyBvZiBkZXRlY3Rpb25zXHJcbiAgdmFyIGRldGVjdGlvbnMgPSB7fVxyXG4gIC8vc2VuZCBzdHVmZiB0byB0aGUgYmFja2VuZFxyXG4gIGJpLnNlbmQobWFwLmdldE5TRVcoKSxmdW5jdGlvbihkZXRlY3Rpb24pe1xyXG4gIFx0aWYgKGRldGVjdGlvbnNbZGV0ZWN0aW9uLmN1YmVfaWRdID09IG51bGwpIHtcclxuICBcdFx0ZGV0ZWN0aW9uc1tkZXRlY3Rpb24uY3ViZV9pZF0gPSBbXTtcclxuICBcdFx0bWFwLmFkZE1hcmtlcihkZXRlY3Rpb24uY3ViZV9pZCxkZXRlY3Rpb24ubGF0LGRldGVjdGlvbi5sb24pXHJcbiAgXHR9XHJcbiAgXHRkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXS5wdXNoKGRldGVjdGlvbilcclxuXHJcbiAgfSk7XHJcbn0iLCJtYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xyXG52YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcclxuZnVuY3Rpb24gc2VuZChib3VuZGluZ0JveCxjYikge1xyXG5cdC8vIGJvdW5kaW5nQm94IHNob3VsZCBiZSBhbiBvYmplY3QgbGlrZSB7dG9wOiA8dG9wPiwgYm90dG9tOiA8Ym90dG9tPiwgbGVmdDogPGxlZnQ+LCByaWdodDogPHJpZ2h0Pn1cclxuXHJcblx0c29ja2V0Lm9uKCdyZWNlaXZlRGV0ZWN0aW9uJywgY2IpO1xyXG5cdC8vIFRPRE86IHNlbmQgbGF0L2xvbiB0byBiYWNrZW5kXHJcblx0Ly8gVE9ETzogcmVjaWV2ZSBkYXRhIGFuZC9vciBpbWFnZXMgZnJvbSBiYWNrZW5kXHJcblx0Ly9jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShib3VuZGluZ0JveCkpO1xyXG5cdHNvY2tldC5lbWl0KCdnZXREZXRlY3Rpb24nLCBib3VuZGluZ0JveCk7XHJcbn1cclxuXHJcbmV4cG9ydHMuc2VuZCA9IHNlbmQ7IiwidmFyIG1hcDtcclxudmFyIGxvY2F0aW9uRmlsdGVyO1xyXG52YXIgcHJ1bmVDbHVzdGVyO1xyXG5cclxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0bWFwID0gTC5tYXAoJ215TWFwJyx7bWF4Wm9vbTogMjJ9KS5zZXRWaWV3KFs0MC4wMTgsLTEwNS4yNzU1XSwgMTgpO1xyXG5cdC8vIExheWVyc1xyXG5cdHZhciBvc20gPSBuZXcgTC5UaWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vcGVuc3RyZWV0bWFwLm9yZy97en0ve3h9L3t5fS5wbmcnLFxyXG5cdFx0e21heE5hdGl2ZVpvb206IDE5LCBtYXhab29tOiAyMn0pO1xyXG5cdHZhciBiaW5nID0gbmV3IEwuQmluZ0xheWVyKFwiQW8wcGdLSmlFelZFV0tDQ2hIVEI1SkJlelc5WHZvTTRXRVNwZVl5d3o4d0JZOWtrV3JaV05kS0JabW1xejIxWVwiLFxyXG5cdFx0e21heE5hdGl2ZVpvb206IDE5LCBtYXhab29tOiAyMn0pO1xyXG5cdG1hcC5hZGRMYXllcihiaW5nKTtcclxuXHRtYXAuYWRkQ29udHJvbChuZXcgTC5Db250cm9sLkxheWVycyh7J09TTSc6b3NtLCBcIkJpbmdcIjpiaW5nfSwge30pKTtcclxuXHJcblx0Ly8gQWRkIGEgYm91bmRpbmcgYm94IHNlbGVjdG9yIHRvIHRoZSBtYXBcclxuXHRsb2NhdGlvbkZpbHRlciA9IG5ldyBMLkxvY2F0aW9uRmlsdGVyKHtcclxuXHRcdGJvdW5kczogTC5MYXRMbmdCb3VuZHMoW1s0MC4wMTg3MTgsIC0xMDUuMjc2MDYxXSxbNDAuMDE3OTc4LCAtMTA1LjI3NDQ0MV1dKSxcclxuXHRcdGVuYWJsZTogdHJ1ZX0pO1xyXG5cdGxvY2F0aW9uRmlsdGVyLmFkZFRvKG1hcCk7XHJcblxyXG5cdHBydW5lQ2x1c3RlciA9IG5ldyBQcnVuZUNsdXN0ZXJGb3JMZWFmbGV0KCk7XHJcblx0bWFwLmFkZExheWVyKHBydW5lQ2x1c3Rlcik7XHJcbn1cclxuZXhwb3J0cy5hZGRNYXJrZXIgPSBmdW5jdGlvbihjdWJlX2lkLGxhdCxsb24pIHtcclxuXHQvL2NvbnNvbGUubG9nKGRldGVjdGlvbik7XHJcblx0dmFyIG1hcmtlciA9IG5ldyBQcnVuZUNsdXN0ZXIuTWFya2VyKGxhdCxsb24pO1xyXG5cdHBydW5lQ2x1c3Rlci5SZWdpc3Rlck1hcmtlcihtYXJrZXIpO1xyXG5cdHBydW5lQ2x1c3Rlci5Qcm9jZXNzVmlldygpO1xyXG59XHJcbmV4cG9ydHMuZ2V0TlNFVyA9IGZ1bmN0aW9uKCkge1xyXG5cdC8vIFJlYWQgdGhlIGJvdW5kaW5nIGJveFxyXG5cdHZhciBib3VuZHMgPSBsb2NhdGlvbkZpbHRlci5nZXRCb3VuZHMoKTtcclxuXHRyZXR1cm4geyBuOiBib3VuZHMuZ2V0Tm9ydGgoKSwgczogYm91bmRzLmdldFNvdXRoKCksIGU6IGJvdW5kcy5nZXRFYXN0KCksIHc6IGJvdW5kcy5nZXRXZXN0KCkgfVxyXG59Il19
