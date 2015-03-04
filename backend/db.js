var async = require('async')
, pool = require('./ms-pooler')
, Request = require('tedious').Request
, TYPES = require('tedious').TYPES

// Monkey patch to get objectMap
async.objectMap = function ( obj, func, cb ) {
	var i, arr = [], keys = Object.keys( obj );
	for ( i = 0; i < keys.length; i += 1 ) {
		var wrapper = {};
		wrapper[keys[i]] = obj[keys[i]];
		arr[i] = wrapper;
	}
	this.map( arr, func, function( err, data ) {
		if ( err ) { return cb( err ); }
		var res = {};
		for ( i = 0; i < data.length; i += 1 ) {
			res[keys[i]] = data[i];
		}
		return cb( err, res );
	});
}

function rowToObj(row,cb) {
	async.objectMap(row, function(obj,map_cb){
		var key = Object.keys(obj)[0];
		map_cb(null,obj[key]['value'])
	}, function(err,results){
		cb(err,results)
	})
}


function query(request,params){
	// console.log('DB: querying')
	// console.log(request)
	pool.acquire(function(err, connection) {
		// console.log('DB: connection acquired')
		if (err) { console.log(err) }
		request.on('doneProc', function (rowCount, more, rows) {
			console.log('DB: query done')
			pool.release(connection);
		});

		request.on('prepared', function(){
			console.log('DB: executing request')
			connection.execute(request, params)
		})

		// console.log('DB: preparing statement')
		connection.prepare(request);
	});
}

function detections(imgObj,cb) {
	// cb -> function(detections,err)
	// console.log('DB: getting db detections')
	getImageId(imgObj,function(err,imgId){
		// console.log('DB: image id ' + err + ' ' + imgId)
		if (err == 'NoImageError') {
			addImage(imgObj,function(err,result){
				if (err) {
					cb(err,null)
				} else {
					cb('NoDetectionsError',null)
				}
			})
		} else if (err) {
			cb(err,null)
		} else {
			getDetectionsFromImgId(imgId,cb)
		}
	})
}

function getDetectionsFromImgId(imgId,cb) {
	var detections = []
	var err = null

	var q = "SELECT * FROM detections " +
			"WHERE image_id = @img_id ";

	var request = new Request(q, function(err,rowCount,rows){
		if (err) {
			cb(err,null)
		} else if (rowCount == 0) {
			cb('NoDetectionsError',null)
		} else {
			rows.forEach(function(row){
				rowToObj(row,cb)
			})
		}
	})
	request.addParameter('img_id',TYPES.Int)

	// console.log('querying database')
	query(request, {
		img_id: imgId
	})
}

function getImageId(imgObj,cb) {
	var q = "SELECT id FROM images " +
			"WHERE cube_id = @cube_id " +
			"AND direction = @direction " +
			"AND zoom_1_coord = @zoom_1_coord " +
			"AND zoom_2_coord = @zoom_2_coord " +
			"AND zoom_3_coord = @zoom_3_coord " +
			"AND zoom_4_coord = @zoom_4_coord";

	var request = new Request(q, function(err,rowCount,rows){
		if (err) {
			cb(err,null)
		} else if (rowCount == 0) {
			cb('NoImageError',null)
		} else {
			rows.forEach(function(row){
				cb(null,row['id']['value'])
			})
		}
	})
	request.addParameter('cube_id',TYPES.Int)
	request.addParameter('direction',TYPES.TinyInt)
	request.addParameter('zoom_1_coord',TYPES.TinyInt)
	request.addParameter('zoom_2_coord',TYPES.TinyInt)
	request.addParameter('zoom_3_coord',TYPES.TinyInt)
	request.addParameter('zoom_4_coord',TYPES.TinyInt)

	query(request, {
		cube_id: imgObj['cube_id'],
		direction: imgObj['direction'],
		zoom_1_coord: imgObj['zoom_coords'][0],
		zoom_2_coord: imgObj['zoom_coords'][1],
		zoom_3_coord: imgObj['zoom_coords'][2],
		zoom_4_coord: imgObj['zoom_coords'][3]
	})
}

function addImage(imgObj, cb) {
	console.log('DB: adding image')
	var q = "INSERT INTO images (cube_id,lat,lon,direction,zoom_1_coord,zoom_2_coord,zoom_3_coord,zoom_4_coord) " +
	        "OUTPUT Inserted.ID " +
	        "VALUES (@cube_id,@lat,@lon,@dir,@z1,@z2,@z3,@z4);"

	var request = new Request(q, function(err,rowCount,rows){
		console.log('DB: add image finished')
		if (err) {
			cb(err,null)
		} else {
			// return imgId
			cb(null,rows[0]['ID']['value'])
		}
	})

	request.addParameter('cube_id',TYPES.Int)
	request.addParameter('lat',TYPES.Int)
	request.addParameter('lon',TYPES.Int)
	request.addParameter('dir',TYPES.TinyInt)
	request.addParameter('z1',TYPES.TinyInt)
	request.addParameter('z2',TYPES.TinyInt)
	request.addParameter('z3',TYPES.TinyInt)
	request.addParameter('z4',TYPES.TinyInt)

	query(request,{
		cube_id: imgObj['cube_id'],
		lat: imgObj['lat'],
		lon: imgObj['lon'],
		dir: imgObj['direction'],
		z1: imgObj['zoom_coords'][0],
		z2: imgObj['zoom_coords'][1],
		z3: imgObj['zoom_coords'][2],
		z4: imgObj['zoom_coords'][3]
	})
}

function addDetection(imgObj,detection,cb) {

	// console.log('DB: adding detection to database')

	var q = "INSERT INTO detections (image_id, x_min, x_max, y_min, y_max)" +
			"OUTPUT Inserted.ID " +
			"VALUES (@image_id,@x_min,@x_max,@y_min,@y_max);"
	var request = new Request(q, function(err,rowCount,rows){
		// console.log('DB: added')
		if (typeof cb !== 'undefined') {
			if (err) {
				cb(err,null)
			} else {
				// return detectionId
				cb(null,rows[0]['ID']['value'])
			}
		}
	})

	request.addParameter('x_min',TYPES.Int,detection['x_min'])
	request.addParameter('x_max',TYPES.Int,detection['x_max'])
	request.addParameter('y_min',TYPES.Int,detection['y_min'])
	request.addParameter('y_max',TYPES.Int,detection['y_max'])

	var params = {
		x_min: detection['x_min'],
		x_max: detection['x_max'],
		y_min: detection['y_min'],
		y_max: detection['y_max']
	}

	// TODO: If imgObj isn't in database, add it
	getImageId(imgObj,function(err,imgId){
		if (err == 'NoImageError'){
			addImage(imgObj,function(err,imgId){
				// The image has been added to the DB. Add the detection.
				request.addParameter('image_id',TYPES.Int)
				params['image_id'] = imgId
				query(request, params)
			})
		} else if (err) {
			cb(err, null)
		} else {
			// The image is in the database. Add the detection.
			request.addParameter('image_id',TYPES.Int)
			params['image_id'] = imgId
			query(request, params)
		}
	})
}

module.exports = exports = {
	detections: detections,
	getDetectionsFromImageId: getDetectionsFromImgId,
	getImageId: getImageId,
	addImage: addImage,
	addDetection: addDetection
}