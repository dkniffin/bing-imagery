(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Map = require('./map.js');
BI = require('./backend-interface.js');
map = require('./map.js')
map.init();

// var map = new Map(document.getElementById("myMap"), new Microsoft.Maps.Location(40, -105.27), 15);

document.getElementById("start").onclick = function() {
  //send stuff to the backend
  BI(map.getNSEW());
}
},{"./backend-interface.js":2,"./map.js":3}],2:[function(require,module,exports){
map = require('./map.js');
var socket = io('http://localhost');
function send(boundingBox) {
	// boundingBox should be an object like {top: <top>, bottom: <bottom>, left: <left>, right: <right>}
	
	socket.on('receiveDetection', function (data) {
		console.log(data);
	});
	// TODO: send lat/lon to backend
	// TODO: recieve data and/or images from backend
	//console.log(JSON.stringify(boundingBox));
	socket.emit('getDetection', boundingBox);
}

module.exports = send;
},{"./map.js":3}],3:[function(require,module,exports){
var map;
var locationFilter;

exports.init = function() {
	map = L.map('myMap').setView([40.018,-105.2755], 18);
	// Layers
	var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
	var bing = new L.BingLayer("Ao0pgKJiEzVEWKCChHTB5JBezW9XvoM4WESpeYywz8wBY9kkWrZWNdKBZmmqz21Y");
	map.addLayer(bing);
	map.addControl(new L.Control.Layers({'OSM':osm, "Bing":bing}, {}));

	// Add a bounding box selector to the map
	locationFilter = new L.LocationFilter({
		bounds: L.LatLngBounds([[40.018718, -105.276061],[40.017978, -105.274441]]),
		enable: true});
	locationFilter.addTo(map);
}
exports.getNSEW = function() {
	// Read the bounding box
	var bounds = locationFilter.getBounds();
	return { n: bounds.getNorth(), s: bounds.getSouth(), e: bounds.getEast(), w: bounds.getWest() }
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcQXBwRGF0YVxcUm9hbWluZ1xcbnBtXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9hcHAuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYmFja2VuZC1pbnRlcmZhY2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gTWFwID0gcmVxdWlyZSgnLi9tYXAuanMnKTtcclxuQkkgPSByZXF1aXJlKCcuL2JhY2tlbmQtaW50ZXJmYWNlLmpzJyk7XHJcbm1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJylcclxubWFwLmluaXQoKTtcclxuXHJcbi8vIHZhciBtYXAgPSBuZXcgTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlNYXBcIiksIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MCwgLTEwNS4yNyksIDE1KTtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vc2VuZCBzdHVmZiB0byB0aGUgYmFja2VuZFxyXG4gIEJJKG1hcC5nZXROU0VXKCkpO1xyXG59IiwibWFwID0gcmVxdWlyZSgnLi9tYXAuanMnKTtcclxudmFyIHNvY2tldCA9IGlvKCdodHRwOi8vbG9jYWxob3N0Jyk7XHJcbmZ1bmN0aW9uIHNlbmQoYm91bmRpbmdCb3gpIHtcclxuXHQvLyBib3VuZGluZ0JveCBzaG91bGQgYmUgYW4gb2JqZWN0IGxpa2Uge3RvcDogPHRvcD4sIGJvdHRvbTogPGJvdHRvbT4sIGxlZnQ6IDxsZWZ0PiwgcmlnaHQ6IDxyaWdodD59XHJcblx0XHJcblx0c29ja2V0Lm9uKCdyZWNlaXZlRGV0ZWN0aW9uJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuXHRcdGNvbnNvbGUubG9nKGRhdGEpO1xyXG5cdH0pO1xyXG5cdC8vIFRPRE86IHNlbmQgbGF0L2xvbiB0byBiYWNrZW5kXHJcblx0Ly8gVE9ETzogcmVjaWV2ZSBkYXRhIGFuZC9vciBpbWFnZXMgZnJvbSBiYWNrZW5kXHJcblx0Ly9jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShib3VuZGluZ0JveCkpO1xyXG5cdHNvY2tldC5lbWl0KCdnZXREZXRlY3Rpb24nLCBib3VuZGluZ0JveCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc2VuZDsiLCJ2YXIgbWFwO1xyXG52YXIgbG9jYXRpb25GaWx0ZXI7XHJcblxyXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcclxuXHRtYXAgPSBMLm1hcCgnbXlNYXAnKS5zZXRWaWV3KFs0MC4wMTgsLTEwNS4yNzU1XSwgMTgpO1xyXG5cdC8vIExheWVyc1xyXG5cdHZhciBvc20gPSBuZXcgTC5UaWxlTGF5ZXIoJ2h0dHA6Ly97c30udGlsZS5vcGVuc3RyZWV0bWFwLm9yZy97en0ve3h9L3t5fS5wbmcnKTtcclxuXHR2YXIgYmluZyA9IG5ldyBMLkJpbmdMYXllcihcIkFvMHBnS0ppRXpWRVdLQ0NoSFRCNUpCZXpXOVh2b000V0VTcGVZeXd6OHdCWTlra1dyWldOZEtCWm1tcXoyMVlcIik7XHJcblx0bWFwLmFkZExheWVyKGJpbmcpO1xyXG5cdG1hcC5hZGRDb250cm9sKG5ldyBMLkNvbnRyb2wuTGF5ZXJzKHsnT1NNJzpvc20sIFwiQmluZ1wiOmJpbmd9LCB7fSkpO1xyXG5cclxuXHQvLyBBZGQgYSBib3VuZGluZyBib3ggc2VsZWN0b3IgdG8gdGhlIG1hcFxyXG5cdGxvY2F0aW9uRmlsdGVyID0gbmV3IEwuTG9jYXRpb25GaWx0ZXIoe1xyXG5cdFx0Ym91bmRzOiBMLkxhdExuZ0JvdW5kcyhbWzQwLjAxODcxOCwgLTEwNS4yNzYwNjFdLFs0MC4wMTc5NzgsIC0xMDUuMjc0NDQxXV0pLFxyXG5cdFx0ZW5hYmxlOiB0cnVlfSk7XHJcblx0bG9jYXRpb25GaWx0ZXIuYWRkVG8obWFwKTtcclxufVxyXG5leHBvcnRzLmdldE5TRVcgPSBmdW5jdGlvbigpIHtcclxuXHQvLyBSZWFkIHRoZSBib3VuZGluZyBib3hcclxuXHR2YXIgYm91bmRzID0gbG9jYXRpb25GaWx0ZXIuZ2V0Qm91bmRzKCk7XHJcblx0cmV0dXJuIHsgbjogYm91bmRzLmdldE5vcnRoKCksIHM6IGJvdW5kcy5nZXRTb3V0aCgpLCBlOiBib3VuZHMuZ2V0RWFzdCgpLCB3OiBib3VuZHMuZ2V0V2VzdCgpIH1cclxufSJdfQ==
