exports.detect = function(url,cb) {
	var detections = []
	var err = null
	// TODO: Find detections

	detections.push({url: url, points: {x_min: 0, x_max: 0, y_min: 0, y_max: 0}})
	//console.log('detecting');
	cb(err,detections);
}