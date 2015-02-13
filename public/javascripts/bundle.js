(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Users\\Derek\\Repositories\\bing-imagery\\public\\javascripts\\app.js":[function(require,module,exports){
// Map = require('./map.js');
BI = require('./backend-interface.js');
map = require('./map.js')
map.init();

// var map = new Map(document.getElementById("myMap"), new Microsoft.Maps.Location(40, -105.27), 15);

document.getElementById("start").onclick = function() {
  //send stuff to the backend
  BI(map.getNSEW());
}
},{"./backend-interface.js":"C:\\Users\\Derek\\Repositories\\bing-imagery\\public\\javascripts\\backend-interface.js","./map.js":"C:\\Users\\Derek\\Repositories\\bing-imagery\\public\\javascripts\\map.js"}],"C:\\Users\\Derek\\Repositories\\bing-imagery\\public\\javascripts\\backend-interface.js":[function(require,module,exports){
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
},{"./map.js":"C:\\Users\\Derek\\Repositories\\bing-imagery\\public\\javascripts\\map.js"}],"C:\\Users\\Derek\\Repositories\\bing-imagery\\public\\javascripts\\map.js":[function(require,module,exports){
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
},{}]},{},["C:\\Users\\Derek\\Repositories\\bing-imagery\\public\\javascripts\\app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcQXBwRGF0YVxcUm9hbWluZ1xcbnBtXFxub2RlX21vZHVsZXNcXHdhdGNoaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9hcHAuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYmFja2VuZC1pbnRlcmZhY2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBNYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xyXG5CSSA9IHJlcXVpcmUoJy4vYmFja2VuZC1pbnRlcmZhY2UuanMnKTtcclxubWFwID0gcmVxdWlyZSgnLi9tYXAuanMnKVxyXG5tYXAuaW5pdCgpO1xyXG5cclxuLy8gdmFyIG1hcCA9IG5ldyBNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJteU1hcFwiKSwgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQwLCAtMTA1LjI3KSwgMTUpO1xyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgLy9zZW5kIHN0dWZmIHRvIHRoZSBiYWNrZW5kXHJcbiAgQkkobWFwLmdldE5TRVcoKSk7XHJcbn0iLCJtYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xyXG52YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcclxuXHJcbmZ1bmN0aW9uIHNlbmQoYm91bmRpbmdCb3gpIHtcclxuXHQvLyBib3VuZGluZ0JveCBzaG91bGQgYmUgYW4gb2JqZWN0IGxpa2Uge3RvcDogPHRvcD4sIGJvdHRvbTogPGJvdHRvbT4sIGxlZnQ6IDxsZWZ0PiwgcmlnaHQ6IDxyaWdodD59XHJcblxyXG5cdHNvY2tldC5vbigncmVjZWl2ZURldGVjdGlvbicsIGZ1bmN0aW9uIChkYXRhKSB7XHJcblx0XHRjb25zb2xlLmxvZyhkYXRhKTtcclxuXHR9KTtcclxuXHQvLyBUT0RPOiBzZW5kIGxhdC9sb24gdG8gYmFja2VuZFxyXG5cdC8vIFRPRE86IHJlY2lldmUgZGF0YSBhbmQvb3IgaW1hZ2VzIGZyb20gYmFja2VuZFxyXG5cdC8vY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoYm91bmRpbmdCb3gpKTtcclxuXHRzb2NrZXQuZW1pdCgnZ2V0RGV0ZWN0aW9uJywgYm91bmRpbmdCb3gpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNlbmQ7IiwidmFyIG1hcDtcclxudmFyIGxvY2F0aW9uRmlsdGVyO1xyXG5cclxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0bWFwID0gTC5tYXAoJ215TWFwJykuc2V0VmlldyhbNDAuMDE4LC0xMDUuMjc1NV0sIDE4KTtcclxuXHQvLyBMYXllcnNcclxuXHR2YXIgb3NtID0gbmV3IEwuVGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGUub3BlbnN0cmVldG1hcC5vcmcve3p9L3t4fS97eX0ucG5nJyk7XHJcblx0dmFyIGJpbmcgPSBuZXcgTC5CaW5nTGF5ZXIoXCJBbzBwZ0tKaUV6VkVXS0NDaEhUQjVKQmV6VzlYdm9NNFdFU3BlWXl3ejh3Qlk5a2tXclpXTmRLQlptbXF6MjFZXCIpO1xyXG5cdG1hcC5hZGRMYXllcihiaW5nKTtcclxuXHRtYXAuYWRkQ29udHJvbChuZXcgTC5Db250cm9sLkxheWVycyh7J09TTSc6b3NtLCBcIkJpbmdcIjpiaW5nfSwge30pKTtcclxuXHJcblx0Ly8gQWRkIGEgYm91bmRpbmcgYm94IHNlbGVjdG9yIHRvIHRoZSBtYXBcclxuXHRsb2NhdGlvbkZpbHRlciA9IG5ldyBMLkxvY2F0aW9uRmlsdGVyKHtcclxuXHRcdGJvdW5kczogTC5MYXRMbmdCb3VuZHMoW1s0MC4wMTg3MTgsIC0xMDUuMjc2MDYxXSxbNDAuMDE3OTc4LCAtMTA1LjI3NDQ0MV1dKSxcclxuXHRcdGVuYWJsZTogdHJ1ZX0pO1xyXG5cdGxvY2F0aW9uRmlsdGVyLmFkZFRvKG1hcCk7XHJcbn1cclxuZXhwb3J0cy5nZXROU0VXID0gZnVuY3Rpb24oKSB7XHJcblx0Ly8gUmVhZCB0aGUgYm91bmRpbmcgYm94XHJcblx0dmFyIGJvdW5kcyA9IGxvY2F0aW9uRmlsdGVyLmdldEJvdW5kcygpO1xyXG5cdHJldHVybiB7IG46IGJvdW5kcy5nZXROb3J0aCgpLCBzOiBib3VuZHMuZ2V0U291dGgoKSwgZTogYm91bmRzLmdldEVhc3QoKSwgdzogYm91bmRzLmdldFdlc3QoKSB9XHJcbn0iXX0=
