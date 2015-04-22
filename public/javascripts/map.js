var locationFilter;
var markers;
var m;

var map = {
	init: function() {
		m = L.map('myMap',{maxZoom: 22}).setView([40.018,-105.2755], 18);
		// Layers
		var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			{maxNativeZoom: 19, maxZoom: 22});
		var bing = new L.BingLayer("Ao0pgKJiEzVEWKCChHTB5JBezW9XvoM4WESpeYywz8wBY9kkWrZWNdKBZmmqz21Y",
			{maxNativeZoom: 19, maxZoom: 22});
		m.addLayer(bing);
		m.addControl(new L.Control.Layers({'OSM':osm, "Bing":bing}, {}));

		markers = new L.MarkerClusterGroup();
		m.addLayer(markers);

		// Add a bounding box selector to the map
		locationFilter = new L.LocationFilter({
			bounds: L.LatLngBounds([[40.018718, -105.276061],[40.017978, -105.274441]]),
			enable: true});
		locationFilter.addTo(m);
	},
	addMarker: function(cube_id,lat,lon) {
		//console.log(detection);
		var marker = L.marker(new L.LatLng(lat, lon));
		marker.bindPopup('<h1> foo </h1>');
		markers.addLayer(marker);
		return marker;
	},
	getNSEW: function() {
		// Read the bounding box
		var bounds = locationFilter.getBounds();
		return { n: bounds.getNorth(), s: bounds.getSouth(), e: bounds.getEast(), w: bounds.getWest() }
	},
	setBoundBox: function(bounds){
		locationFilter.setBounds(bounds);
		m.fitBounds(bounds);
	}
}


// Zoom to location buttons
$('.location').each(function(i,element){
  $(element).click(function(e){
    var ne,sw;
    switch (e.target.id) {
      case 'loc_times_square':
      	ne = L.latLng(40.75814979112882,-73.98533195257187)
        sw = L.latLng(40.75779627463774,-73.98581206798553);

      case 'loc_bing_1cube':
      	ne = L.latLng(40.01804329142695,-105.27583345770836);
      	sw = L.latLng(40.018010425046754,-105.27586363255978);
    }

    var bounds = L.latLngBounds(ne,sw);
    console.log(bounds);

    map.setBoundBox(bounds);
  })
});
