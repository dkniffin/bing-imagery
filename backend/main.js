var Combinatorics = require('js-combinatorics').Combinatorics
, request = require('request')
, qs = require('querystring')
, _ = require('underscore')
, async = require('async')

, db = require('./db.js')
, detector = require('./detector.js')

var DIR_MAP = { "FRONT": 1, "RIGHT": 2, "BACK": 3, "LEFT": 4, "UP": 5, "DOWN": 6 };


function base4(dec) {
	return Number(dec).toString(4);
}

function pad(num, size) {
	 var s = num+"";
	 while (s.length < size) s = "0" + s;
	 return s;
}

function reduceConcat(memo,item,cb){
	memo.concat(item)
}


function getImageObjs(n,s,e,w,dirs,zoom,cb) {
	queryCubesAPI({c:1, n:n, s:s, e:e, w:w},function(err,res,json){
		objects = JSON.parse(json).slice(1)
		var all_zoom_coords = Combinatorics.baseN([0,1,2,3],zoom).toArray()

		imgObjs = async.concat(objects,function(obj,map_cb){
			async.concat(dirs,function(dir,map2_cb){
				async.concat(all_zoom_coords,function(zoom_coords,map3_cb){
					map3_cb(null,{
						cube_id: obj['id'],
						lat: obj['la'],
						lon: obj['lo'],
						direction: DIR_MAP[dir],
						zoom_coords: zoom_coords
					})
				},function(err,result){
					map2_cb(err,result)
				})
			},function(err,result){
				map_cb(err,result)
			})
		}, function(err,result){
			cb(err, result)
		})
	})
}

function queryCubesAPI(params,cb) {
	var streetside_api_url = "http://dev.virtualearth.net/mapcontrol/HumanScaleServices/GetBubbles.ashx";
	var cubes = [];
	var url = streetside_api_url + '?' + qs.stringify(params);
	request(url, function(err,res,data){
		cb(err,res,data)
	})
}

function imgURL(imgObj) {
	var id = imgObj['cube_id'];
	var dir = imgObj['direction'];
	var zoom_coords = imgObj['zoom_coords'];
	var url_id = pad(base4(id),16);
	var url_dir = pad(base4(dir),2);
	var url_tile_coord = zoom_coords.join('');

	var url_param = url_id + url_dir + url_tile_coord;
	//console.log("url_id:" + url_id + " url_dir:" + url_dir + " url_tile_coord: " + url_tile_coord)
	//console.log("http://ak.t1.tiles.virtualearth.net/tiles/hs" + url_param + ".jpg?g=2981&n=z")
	return "http://ak.t1.tiles.virtualearth.net/tiles/hs" + url_param + ".jpg?g=2981&n=z"
}


function imgURLs(id,dirs,zoom,cb) {
	dirs.forEach(function(dir){
		var all_zoom_coords = Combinatorics.baseN([0,1,2,3],zoom)
		all_zoom_coords.toArray().forEach(function(zoom_coords){
			cb(imgURL(id,dir,zoom_coords))
		})
	})
}

exports.getDetections = function(n,s,e,w,cb) {
	var zoom = 3
	var dirs = ['LEFT','RIGHT']

	getImageObjs(n,s,e,w,dirs,zoom,function(err, imgs){
		if (err) { return } // TODO: cb
		async.each(imgs,function(imgObj,img_cb){
			// console.log('processing image object '+imgObj['cube_id'])
			// console.log('processing image '+imgURL(imgObj))
			db.detections(imgObj,function(err, detection){
				var url = imgURL(imgObj);
				if (err == 'NoDetectionsError') {
					// console.log('running detector for '+imgObj['cube_id'])
					// Detection hasn't been run on this cube
					// Run detector
					detector.detect(url, function(err,detections){
						async.each(detections,function(detection, detect_cb){
							// console.log('found detection')
							// Add detections to the database
							db.addDetection(imgObj,detection)

							//Send results to frontend
							cb(err,{
								url: url,
								lat: imgObj['lat'],
								lon: imgObj['lon'],
								detect_coords: detection
							})

							detect_cb()
							img_cb()
						})
					})
				} else if (err != null) {
					console.error(err) // TODO: cb
				} else {
					// Send results to frontend
					cb(null,{
						url: url,
						lat: imgObj['lat'],
						lon: imgObj['lon'],
						detect_coords: detection
					})
				}
			})
		})
	})
}

exports.getURLs = function(n,s,e,w,cb) {
	var zoom = 3
	var dirs = ['LEFT','RIGHT']

	getImageObjs(n,s,e,w,dirs,zoom,function(err, imgs){
		imgs.forEach(function(imgObj){
			var url = imgURL(imgObj);

			//Dummy object to hold legitimate url and illegitimate points.
			var data = {
				url: imgURL(imgObj),
				points: {
					tr: {
						x: 1,
						y: 1
					},
					tl: {
						x: -1,
						y: 1
					},
					bl: {
						x: -1,
						y: -1
					},
					br: {
						x:1,
						y:-1
					}
				}
			}
			cb(null,data)
		})
	})
}