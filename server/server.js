var http = require('http').createServer(handler);
var io = require('socket.io').listen(http, { log: false });
var fs = require('fs');

http.listen('9000');

//Server handler
function handler(req, res){
	fs.readFile('../index.html',
		function (err, data) {
		    if (err) {
				res.writeHead(500);
				return res.end('Error loading index.html');
		    }

		    res.writeHead(200);
		    res.end(data);
	  	});
}

//Player List
var users = {};

io.sockets.on('connection', function(socket){
	//Detect socket when you connect
	socket.on('connect', function(data){
		//Save player on the Array
		users[data.nickname] = new chatUser(data.nickname, socket.id);

		//Send broadcast of connection
		socket.broadcast.emit('user_connect', {'nickname' : data.nickname});

		log('Connecting: ' + data.nickname);
	});

	//send message trough sockets
	socket.on('emit_message', function(data){
		log(data.nickname + ': ' + data.message);

		//Send the message trought broadcast
		socket.broadcast.emit('user_message', {'nickname' : data.nickname, 'message' : data.message });
	});

	//Detect the Disconnection
	socket.on('disconnect', function(){
		for (key in users){
			if( users[key].socketId  == socket.id){
				log('Disconnecting: ' + key);

				//Send broadcast of disconnection
				socket.broadcast.emit('user_disconnect', {'nickname' : users[key].nickname});

				delete users[key];
			}
		}
	});
});

//User Class
function chatUser(nickname, socketId){
	this.nickname = nickname;
	this.socketId = socketId;
}

function log(logMessage){
	console.log(logMessage);
}