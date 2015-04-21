var socket = io();

var bi = {
	send: function send(data,cb) {
		// boundingBox should be an object like {top: <top>, bottom: <bottom>, left: <left>, right: <right>}

		socket.on('receiveDetection', cb);
		// TODO: send lat/lon to backend
		// TODO: recieve data and/or images from backend
		//console.log(JSON.stringify(boundingBox));
		socket.emit('getDetection', data);
	}
}
