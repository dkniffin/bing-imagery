//var config = require('./db-config')
var Connection = require('tedious').Connection,
	TYPES = require('tedious').TYPES,
	TediousPooler = require('./TediousPooler'),
	config = require('./db-config'),
    pooler = new TediousPooler(config),
    Request = require('tedious').Request;

exports.detections = function(imgObj,cb) {
	// cb -> function(detections,err)
	// console.log(imgObj['cube_id'],imgObj['direction'],imgObj['zoom_coords'][0])

	var detections = []
	var err = null

	var q = "SELECT * FROM detections " +
			"LEFT JOIN images " +
				"ON detections.image_id=images.id ";
			"WHERE cube_id = @cube_id " +
			"AND direction = @direction " +
			"AND zoom_1_coord = @zoom_1_coord " +
			"AND zoom_2_coord = @zoom_2_coord " +
			"AND zoom_3_coord = @zoom_3_coord " +
			"AND zoom_4_coord = @zoom_4_coord";

	var request = new Request(q, function(err,rowCount,rows){
		if (err) {
			cb(null,err)
		} else if (rowCount == 0) {
			cb(null,'NoDetectionsError')
		} else {
			rows.forEach(function(row){
				cb(row,null)
			})
		}
	})
	request.addParameter('cube_id',TYPES.Int,imgObj['cube_id'])
	request.addParameter('direction',TYPES.TinyInt,imgObj['direction'])
	request.addParameter('zoom_1_coord',TYPES.TinyInt,imgObj['zoom_coords'][0])
	request.addParameter('zoom_2_coord',TYPES.TinyInt,imgObj['zoom_coords'][1])
	request.addParameter('zoom_3_coord',TYPES.TinyInt,imgObj['zoom_coords'][2])
	request.addParameter('zoom_4_coord',TYPES.TinyInt,imgObj['zoom_coords'][3])

	// console.log('querying database')
	pooler.execute(function(connection){ connection.execSql(request);});
}

exports.addDetection = function(imgObj,detection) {

	console.log('adding detection to database')

	// TODO: If imgObj isn't in database, add it

	// var q = "INSERT INTO detections (image_id, x_min, x_max, y_min, y_max)" +
	// 		"VALUES (@image_id,@x_min,@x_max,@y_min,@y_max);"

	// var conn = new Connection(config);
	// conn.on('connect',function(err){
	// 	if (err) { console.error(err) }

	// 	request = new Request(q, function(err,rowCount){
	// 		if(err) {
	// 			console.error(err);
	// 		} else {
	// 			console.log(rowCount + ' rows');
	// 		}
	// 	})
	// 	request.addParameter('image_id',TYPES.Int,0);

	// 	request.on('row',function(columns){
	// 		columns.forEach(function(column){
	// 			console.log(column.value);
	// 		})
	// 	})
	// })
}