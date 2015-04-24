var socket = io();

var bi = {
	send: function send(data,d_cb,count_cb,fin_cb) {
		// boundingBox should be an object like {top: <top>, bottom: <bottom>, left: <left>, right: <right>}

		socket.on('receiveDetection', d_cb);
		socket.on('imageCount', count_cb);
		socket.on('imageDone', fin_cb);

		socket.emit('getDetection', data);
	}
}
