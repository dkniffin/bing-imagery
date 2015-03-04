var async = require('async')
var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'bit',
  password        : 'qwerty',
  database        : 'bit_detections'
});

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
			"WHERE image_id = ?";

	q = mysql.format(q,[imgId])

	pool.query(q, function(err, rows, fields) {
		if (err) {
			cb(err,null)
		} else if (rows.length == 0) {
			cb('NoDetectionsError',null)
		} else {
			cb(null,rows)
		}
	})
}

function getImageId(imgObj,cb) {
	var q = "SELECT id FROM images " +
			"WHERE cube_id = ? " +
			"AND direction = ? " +
			"AND zoom_1_coord = ? " +
			"AND zoom_2_coord = ? " +
			"AND zoom_3_coord = ? " +
			"AND zoom_4_coord = ?";

	q = mysql.format(q,[
		imgObj['cube_id'],
		imgObj['direction'],
		imgObj['zoom_coords'][0],
		imgObj['zoom_coords'][1],
		imgObj['zoom_coords'][2],
		imgObj['zoom_coords'][3]
	])

	pool.query(q, function(err, rows, fields) {
		if (err) {
			cb(err,null)
		} else if (rows.length == 0) {
			cb('NoImageError',null)
		} else {
			rows.forEach(function(row){
				cb(null,row['id'])
			})
		}
	});
}

function addImage(imgObj, cb) {
	// console.log('DB: adding image')
	var q = "INSERT INTO images (cube_id,lat,lon,direction,zoom_1_coord,zoom_2_coord,zoom_3_coord,zoom_4_coord) " +
	        "VALUES (?,?,?,?,?,?,?,?);"

	q = mysql.format(q,[
		imgObj['cube_id'],
		imgObj['lat'],
		imgObj['lon'],
		imgObj['direction'],
		imgObj['zoom_coords'][0],
		imgObj['zoom_coords'][1],
		imgObj['zoom_coords'][2],
		imgObj['zoom_coords'][3]
	])

	pool.query(q, function(err, rows, fields) {
		// console.log('DB: add image finished')
		if (err) {
			cb(err,null)
		} else {
			// return imgId
			cb(null,rows.insertId)
		}
	});
}

function addDetection(imgObj,detection,cb) {

	// console.log('DB: adding detection to database')

	var q = "INSERT INTO detections (x_min, x_max, y_min, y_max, image_id) " +
			"VALUES (?,?,?,?,?);"

	// console.log('DB: added')

	var params = [
		detection['x_min'],
		detection['x_max'],
		detection['y_min'],
		detection['y_max']
	];

	function query(q,p){
		q = mysql.format(q,p)
		pool.query(q, function(err, rows, fields) {
			if (typeof cb !== 'undefined') {
				if (err) {
					cb(err,null)
				} else {
					// return detectionId
					cb(null,rows.insertId)
				}
			}
		})
	}

	// TODO: If imgObj isn't in database, add it
	getImageId(imgObj,function(err,imgId){
		if (err == 'NoImageError'){
			addImage(imgObj,function(err,imgId){
				// The image has been added to the DB. Add the detection.
				params.push(imgId)
				query(q,params)
			})
		} else if (err) {
			cb(err, null)
		} else {
			// The image is in the database. Add the detection.
			params.push(imgId)
			query(q,params)
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