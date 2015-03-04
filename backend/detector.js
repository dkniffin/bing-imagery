exports.detect = function(url,cb) {
	var detections = []
	var err = null
	// TODO: Find detections

	detections.push({x_min: 0, x_max: 10, y_min: 0, y_max: 10})
	//console.log('detecting');
	cb(err,detections);
}