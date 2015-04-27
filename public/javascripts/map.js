var locationFilter;
var markers;
var m;

var map = {
	init: function() {
		m = L.map('myMap',{maxZoom: 22}).setView([40.018,-105.2755], 18);
    m.zoomControl.setPosition('topright');
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
			break;
		// case 'loc_bing_1cube':
		// 	ne = L.latLng(40.01804329142695,-105.27583345770836);
		// 	sw = L.latLng(40.018010425046754,-105.27586363255978);
		// 	break;
		case 'loc_pearl_street':
			ne = L.latLng(40.01885621576159,-105.27602791786192);
			sw = L.latLng(40.017418313954614,-105.28151035308838);
			break;
		case 'loc_herald_square':
			ne = L.latLng(40.75078650776183,-73.98761451244354);
			sw = L.latLng(40.749638461019245,-73.98799002170563);
			break;
		case 'loc_world_trade_center':
			ne = L.latLng(40.71025049199978,-74.01247054338455);
			sw = L.latLng(40.70967205495463,-74.01294529438019);
			break;
		case 'loc_eiffel_tower':
			ne = L.latLng(48.85809053223806,2.295488119125366);
			sw = L.latLng(48.85767760016755,2.2948604822158813);
			break;
		case 'loc_louvre':
			ne = L.latLng(48.861679794747374,2.3346751928329468);
			sw = L.latLng(48.86104101660909,2.334272861480713);
			break;
		case 'loc_empire_state_building':
			ne = L.latLng(40.74797426603736,-73.98477941751479);
			sw = L.latLng(40.74761053992251,-73.9853185415268);
			break;
		case 'loc_central_park':
			ne = L.latLng(40.775057467538666,-73.97427320480347);
			sw = L.latLng(40.7744521635941,-73.9750349521637);
			break;

		}

		var bounds = L.latLngBounds(ne,sw);
		console.log(bounds);

		map.setBoundBox(bounds);
	})
});
