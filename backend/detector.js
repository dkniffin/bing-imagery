exports.detect = function(url,cb) {
	var detections = []
	var err = null
	// TODO: Find detections

	detections.push({x_min: 0, x_max: 10, y_min: 0, y_max: 10})
	//console.log('detecting');
	cb(err,detections);
}

// http://dev.virtualearth.net/mapcontrol/HumanScaleServices/GetBubbles.ashx?c=1&n=40.01910&s=40.01758&e=-105.27450&w=-105.27575
//40.01758,-105.27575
//40.01910,-105.27450