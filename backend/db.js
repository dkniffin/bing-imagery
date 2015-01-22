// var config = require('./config')
//
// var conn_str = config.conn_str;
//
// sql.query(conn_str, "SELECT name FROM sys.types WHERE name LIKE ?", [like], function (err, results) {
//
    // assert.ifError(err);
//
    // for (var row = 0; row < results.length; ++row) {
//
        // assert(results[row].name.substr(0, 3) == 'var');
    // }
//
    // done();
// });

exports.detections = function(cubeId,cb) {
	console.log('querying database')
	var detections = []
	var err = 'NoDetectionsError'
	cb(detections,err)
}
exports.addDetections = function(cubeId, detections){
	console.log('adding detections to database')
}