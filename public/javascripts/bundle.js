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
  	console.log(detection.url)
  	if (detections[detection.cube_id] == null) {
  		detections[detection.cube_id] = [];
  		var marker = map.addMarker(detection.cube_id,detection.lat,detection.lon)
  		marker.data.popup = function(data,category){
  			var content = '<div class="img_popup">'
  			detections[detection.cube_id].forEach(function(d){
  				content += '<img src=' + d.url + '/>';
  			})
  			content += '</div>';
  			return content;
  		};
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
	return marker;
}
exports.getNSEW = function() {
	// Read the bounding box
	var bounds = locationFilter.getBounds();
	return { n: bounds.getNorth(), s: bounds.getSouth(), e: bounds.getEast(), w: bounds.getWest() }
}
},{}]},{},["C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXEFwcERhdGFcXFJvYW1pbmdcXG5wbVxcbm9kZV9tb2R1bGVzXFx3YXRjaGlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2JhY2tlbmQtaW50ZXJmYWNlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL21hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gTWFwID0gcmVxdWlyZSgnLi9tYXAuanMnKTtcclxuYmkgPSByZXF1aXJlKCcuL2JhY2tlbmQtaW50ZXJmYWNlLmpzJyk7XHJcbm1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJylcclxubWFwLmluaXQoKTtcclxuXHJcbi8vIHZhciBtYXAgPSBuZXcgTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlNYXBcIiksIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MCwgLTEwNS4yNyksIDE1KTtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAvLyBPYmplY3QgZm9yIHN0b3JpbmcgZGV0ZWN0aW9uc1xyXG4gIC8vIFNob3VsZCBtYXAgY3ViZV9pZCB0byBhcnJheXMgb2YgZGV0ZWN0aW9uc1xyXG4gIHZhciBkZXRlY3Rpb25zID0ge31cclxuICAvL3NlbmQgc3R1ZmYgdG8gdGhlIGJhY2tlbmRcclxuICBiaS5zZW5kKG1hcC5nZXROU0VXKCksZnVuY3Rpb24oZGV0ZWN0aW9uKXtcclxuICBcdGNvbnNvbGUubG9nKGRldGVjdGlvbi51cmwpXHJcbiAgXHRpZiAoZGV0ZWN0aW9uc1tkZXRlY3Rpb24uY3ViZV9pZF0gPT0gbnVsbCkge1xyXG4gIFx0XHRkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXSA9IFtdO1xyXG4gIFx0XHR2YXIgbWFya2VyID0gbWFwLmFkZE1hcmtlcihkZXRlY3Rpb24uY3ViZV9pZCxkZXRlY3Rpb24ubGF0LGRldGVjdGlvbi5sb24pXHJcbiAgXHRcdG1hcmtlci5kYXRhLnBvcHVwID0gZnVuY3Rpb24oZGF0YSxjYXRlZ29yeSl7XHJcbiAgXHRcdFx0dmFyIGNvbnRlbnQgPSAnPGRpdiBjbGFzcz1cImltZ19wb3B1cFwiPidcclxuICBcdFx0XHRkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXS5mb3JFYWNoKGZ1bmN0aW9uKGQpe1xyXG4gIFx0XHRcdFx0Y29udGVudCArPSAnPGltZyBzcmM9JyArIGQudXJsICsgJy8+JztcclxuICBcdFx0XHR9KVxyXG4gIFx0XHRcdGNvbnRlbnQgKz0gJzwvZGl2Pic7XHJcbiAgXHRcdFx0cmV0dXJuIGNvbnRlbnQ7XHJcbiAgXHRcdH07XHJcbiAgXHR9XHJcbiAgXHRkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXS5wdXNoKGRldGVjdGlvbilcclxuXHJcblxyXG4gIH0pO1xyXG59IiwibWFwID0gcmVxdWlyZSgnLi9tYXAuanMnKTtcclxudmFyIHNvY2tldCA9IGlvKCdodHRwOi8vbG9jYWxob3N0Jyk7XHJcbmZ1bmN0aW9uIHNlbmQoYm91bmRpbmdCb3gsY2IpIHtcclxuXHQvLyBib3VuZGluZ0JveCBzaG91bGQgYmUgYW4gb2JqZWN0IGxpa2Uge3RvcDogPHRvcD4sIGJvdHRvbTogPGJvdHRvbT4sIGxlZnQ6IDxsZWZ0PiwgcmlnaHQ6IDxyaWdodD59XHJcblxyXG5cdHNvY2tldC5vbigncmVjZWl2ZURldGVjdGlvbicsIGNiKTtcclxuXHQvLyBUT0RPOiBzZW5kIGxhdC9sb24gdG8gYmFja2VuZFxyXG5cdC8vIFRPRE86IHJlY2lldmUgZGF0YSBhbmQvb3IgaW1hZ2VzIGZyb20gYmFja2VuZFxyXG5cdC8vY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoYm91bmRpbmdCb3gpKTtcclxuXHRzb2NrZXQuZW1pdCgnZ2V0RGV0ZWN0aW9uJywgYm91bmRpbmdCb3gpO1xyXG59XHJcblxyXG5leHBvcnRzLnNlbmQgPSBzZW5kOyIsInZhciBtYXA7XHJcbnZhciBsb2NhdGlvbkZpbHRlcjtcclxudmFyIHBydW5lQ2x1c3RlcjtcclxuXHJcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdG1hcCA9IEwubWFwKCdteU1hcCcse21heFpvb206IDIyfSkuc2V0VmlldyhbNDAuMDE4LC0xMDUuMjc1NV0sIDE4KTtcclxuXHQvLyBMYXllcnNcclxuXHR2YXIgb3NtID0gbmV3IEwuVGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGUub3BlbnN0cmVldG1hcC5vcmcve3p9L3t4fS97eX0ucG5nJyxcclxuXHRcdHttYXhOYXRpdmVab29tOiAxOSwgbWF4Wm9vbTogMjJ9KTtcclxuXHR2YXIgYmluZyA9IG5ldyBMLkJpbmdMYXllcihcIkFvMHBnS0ppRXpWRVdLQ0NoSFRCNUpCZXpXOVh2b000V0VTcGVZeXd6OHdCWTlra1dyWldOZEtCWm1tcXoyMVlcIixcclxuXHRcdHttYXhOYXRpdmVab29tOiAxOSwgbWF4Wm9vbTogMjJ9KTtcclxuXHRtYXAuYWRkTGF5ZXIoYmluZyk7XHJcblx0bWFwLmFkZENvbnRyb2wobmV3IEwuQ29udHJvbC5MYXllcnMoeydPU00nOm9zbSwgXCJCaW5nXCI6YmluZ30sIHt9KSk7XHJcblxyXG5cdC8vIEFkZCBhIGJvdW5kaW5nIGJveCBzZWxlY3RvciB0byB0aGUgbWFwXHJcblx0bG9jYXRpb25GaWx0ZXIgPSBuZXcgTC5Mb2NhdGlvbkZpbHRlcih7XHJcblx0XHRib3VuZHM6IEwuTGF0TG5nQm91bmRzKFtbNDAuMDE4NzE4LCAtMTA1LjI3NjA2MV0sWzQwLjAxNzk3OCwgLTEwNS4yNzQ0NDFdXSksXHJcblx0XHRlbmFibGU6IHRydWV9KTtcclxuXHRsb2NhdGlvbkZpbHRlci5hZGRUbyhtYXApO1xyXG5cclxuXHRwcnVuZUNsdXN0ZXIgPSBuZXcgUHJ1bmVDbHVzdGVyRm9yTGVhZmxldCgpO1xyXG5cdG1hcC5hZGRMYXllcihwcnVuZUNsdXN0ZXIpO1xyXG59XHJcbmV4cG9ydHMuYWRkTWFya2VyID0gZnVuY3Rpb24oY3ViZV9pZCxsYXQsbG9uKSB7XHJcblx0Ly9jb25zb2xlLmxvZyhkZXRlY3Rpb24pO1xyXG5cdHZhciBtYXJrZXIgPSBuZXcgUHJ1bmVDbHVzdGVyLk1hcmtlcihsYXQsbG9uKTtcclxuXHRwcnVuZUNsdXN0ZXIuUmVnaXN0ZXJNYXJrZXIobWFya2VyKTtcclxuXHRwcnVuZUNsdXN0ZXIuUHJvY2Vzc1ZpZXcoKTtcclxuXHRyZXR1cm4gbWFya2VyO1xyXG59XHJcbmV4cG9ydHMuZ2V0TlNFVyA9IGZ1bmN0aW9uKCkge1xyXG5cdC8vIFJlYWQgdGhlIGJvdW5kaW5nIGJveFxyXG5cdHZhciBib3VuZHMgPSBsb2NhdGlvbkZpbHRlci5nZXRCb3VuZHMoKTtcclxuXHRyZXR1cm4geyBuOiBib3VuZHMuZ2V0Tm9ydGgoKSwgczogYm91bmRzLmdldFNvdXRoKCksIGU6IGJvdW5kcy5nZXRFYXN0KCksIHc6IGJvdW5kcy5nZXRXZXN0KCkgfVxyXG59Il19
