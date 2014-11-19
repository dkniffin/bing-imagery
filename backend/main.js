function base64(dec) {
	return Number(dec).toString(4);
}

function pad(num, size) {
	 var s = num+"";
	 while (s.length < size) s = "0" + s;
	 return s;
}

exports.getCubeDetails = function(n,s,e,w) {
	var streetside_api_url = "http://dev.virtualearth.net/mapcontrol/HumanScaleServices/GetBubbles.ashx";
	var ids = [];

	$.ajax({
		url: streetside_api_url,
		crossDomain: true,
		dataType: "jsonp",
		jsonp: "jscallback",
		data: {c:1, n:n, s:s, e:e, w:w},
		success: function( data ) {
			ids = data.slice(1).map(function(obj){obj["id"]});
			console.log(ids);
		}
	});

	return ids;
}

exports.cubeURL = function(id,dir,zoom1,zoom2,zoom3,zoom4) {
	var DIR_STRINGS = { "FRONT": 1, "RIGHT": 2, "BACK": 3, "LEFT": 4, "UP": 5, "DOWN": 6 };
	if (typeof dir == "string") {
		dir = DIR_STRINGS[dir];
	}
	var url_id = pad(base4(id),16);
	var url_dir = pad(base4(dir),4);
	var url_tile_coord = "" + zoom4 + zoom3 + zoom2 + zoom1;

	var url_param = url_id + url_dir + url_tile_coord;
	return "http://ak.t1.tiles.virtualearth.net/tiles/hs" + url_param + ".jpg?g=2981&n=z"
}