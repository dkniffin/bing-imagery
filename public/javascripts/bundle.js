(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\app.js":[function(require,module,exports){
// Map = require('./map.js');
bi = require('./backend-interface.js');
map = require('./map.js')
map.init();

// var map = new Map(document.getElementById("myMap"), new Microsoft.Maps.Location(40, -105.27), 15);

document.getElementById("start").onclick = function() {
  //send stuff to the backend
  bi.send(map.getNSEW(),function(detection){
  	map.addDetection(detection)
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

	pruneCluster = new PruneClusterForLeaflet();
	map.addLayer(pruneCluster);
}
exports.addDetection = function(detection) {
	var marker = new PruneCluster.Marker(detection['lat'],detection['lon']);
	pruneCluster.RegisterMarker(marker);
	pruneCluster.ProcessView();
}
exports.getNSEW = function() {
	// Read the bounding box
	var bounds = locationFilter.getBounds();
	return { n: bounds.getNorth(), s: bounds.getSouth(), e: bounds.getEast(), w: bounds.getWest() }
}
},{}]},{},["C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXEFwcERhdGFcXFJvYW1pbmdcXG5wbVxcbm9kZV9tb2R1bGVzXFx3YXRjaGlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2JhY2tlbmQtaW50ZXJmYWNlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL21hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJyk7XHJcbmJpID0gcmVxdWlyZSgnLi9iYWNrZW5kLWludGVyZmFjZS5qcycpO1xyXG5tYXAgPSByZXF1aXJlKCcuL21hcC5qcycpXHJcbm1hcC5pbml0KCk7XHJcblxyXG4vLyB2YXIgbWFwID0gbmV3IE1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm15TWFwXCIpLCBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDAsIC0xMDUuMjcpLCAxNSk7XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAvL3NlbmQgc3R1ZmYgdG8gdGhlIGJhY2tlbmRcclxuICBiaS5zZW5kKG1hcC5nZXROU0VXKCksZnVuY3Rpb24oZGV0ZWN0aW9uKXtcclxuICBcdG1hcC5hZGREZXRlY3Rpb24oZGV0ZWN0aW9uKVxyXG4gIH0pO1xyXG59IiwibWFwID0gcmVxdWlyZSgnLi9tYXAuanMnKTtcclxudmFyIHNvY2tldCA9IGlvKCdodHRwOi8vbG9jYWxob3N0Jyk7XHJcbmZ1bmN0aW9uIHNlbmQoYm91bmRpbmdCb3gsY2IpIHtcclxuXHQvLyBib3VuZGluZ0JveCBzaG91bGQgYmUgYW4gb2JqZWN0IGxpa2Uge3RvcDogPHRvcD4sIGJvdHRvbTogPGJvdHRvbT4sIGxlZnQ6IDxsZWZ0PiwgcmlnaHQ6IDxyaWdodD59XHJcblxyXG5cdHNvY2tldC5vbigncmVjZWl2ZURldGVjdGlvbicsIGNiKTtcclxuXHQvLyBUT0RPOiBzZW5kIGxhdC9sb24gdG8gYmFja2VuZFxyXG5cdC8vIFRPRE86IHJlY2lldmUgZGF0YSBhbmQvb3IgaW1hZ2VzIGZyb20gYmFja2VuZFxyXG5cdC8vY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoYm91bmRpbmdCb3gpKTtcclxuXHRzb2NrZXQuZW1pdCgnZ2V0RGV0ZWN0aW9uJywgYm91bmRpbmdCb3gpO1xyXG59XHJcblxyXG5leHBvcnRzLnNlbmQgPSBzZW5kOyIsInZhciBtYXA7XHJcbnZhciBsb2NhdGlvbkZpbHRlcjtcclxudmFyIHBydW5lQ2x1c3RlcjtcclxuXHJcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdG1hcCA9IEwubWFwKCdteU1hcCcpLnNldFZpZXcoWzQwLjAxOCwtMTA1LjI3NTVdLCAxOCk7XHJcblx0Ly8gTGF5ZXJzXHJcblx0dmFyIG9zbSA9IG5ldyBMLlRpbGVMYXllcignaHR0cDovL3tzfS50aWxlLm9wZW5zdHJlZXRtYXAub3JnL3t6fS97eH0ve3l9LnBuZycpO1xyXG5cdHZhciBiaW5nID0gbmV3IEwuQmluZ0xheWVyKFwiQW8wcGdLSmlFelZFV0tDQ2hIVEI1SkJlelc5WHZvTTRXRVNwZVl5d3o4d0JZOWtrV3JaV05kS0JabW1xejIxWVwiKTtcclxuXHRtYXAuYWRkTGF5ZXIoYmluZyk7XHJcblx0bWFwLmFkZENvbnRyb2wobmV3IEwuQ29udHJvbC5MYXllcnMoeydPU00nOm9zbSwgXCJCaW5nXCI6YmluZ30sIHt9KSk7XHJcblxyXG5cdC8vIEFkZCBhIGJvdW5kaW5nIGJveCBzZWxlY3RvciB0byB0aGUgbWFwXHJcblx0bG9jYXRpb25GaWx0ZXIgPSBuZXcgTC5Mb2NhdGlvbkZpbHRlcih7XHJcblx0XHRib3VuZHM6IEwuTGF0TG5nQm91bmRzKFtbNDAuMDE4NzE4LCAtMTA1LjI3NjA2MV0sWzQwLjAxNzk3OCwgLTEwNS4yNzQ0NDFdXSksXHJcblx0XHRlbmFibGU6IHRydWV9KTtcclxuXHRsb2NhdGlvbkZpbHRlci5hZGRUbyhtYXApO1xyXG5cclxuXHRwcnVuZUNsdXN0ZXIgPSBuZXcgUHJ1bmVDbHVzdGVyRm9yTGVhZmxldCgpO1xyXG5cdG1hcC5hZGRMYXllcihwcnVuZUNsdXN0ZXIpO1xyXG59XHJcbmV4cG9ydHMuYWRkRGV0ZWN0aW9uID0gZnVuY3Rpb24oZGV0ZWN0aW9uKSB7XHJcblx0dmFyIG1hcmtlciA9IG5ldyBQcnVuZUNsdXN0ZXIuTWFya2VyKGRldGVjdGlvblsnbGF0J10sZGV0ZWN0aW9uWydsb24nXSk7XHJcblx0cHJ1bmVDbHVzdGVyLlJlZ2lzdGVyTWFya2VyKG1hcmtlcik7XHJcblx0cHJ1bmVDbHVzdGVyLlByb2Nlc3NWaWV3KCk7XHJcbn1cclxuZXhwb3J0cy5nZXROU0VXID0gZnVuY3Rpb24oKSB7XHJcblx0Ly8gUmVhZCB0aGUgYm91bmRpbmcgYm94XHJcblx0dmFyIGJvdW5kcyA9IGxvY2F0aW9uRmlsdGVyLmdldEJvdW5kcygpO1xyXG5cdHJldHVybiB7IG46IGJvdW5kcy5nZXROb3J0aCgpLCBzOiBib3VuZHMuZ2V0U291dGgoKSwgZTogYm91bmRzLmdldEVhc3QoKSwgdzogYm91bmRzLmdldFdlc3QoKSB9XHJcbn0iXX0=
