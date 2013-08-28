var http = require('http').createServer(handler);
var io = require('socket.io').listen(http, { log: false });
var fs = require('fs');
var url = require("url");
var path = require("path");

//Server handler - Serve Files
function handler(request, response){
	var uri = url.parse(request.url).pathname,
		filename = path.join(process.cwd(), uri);

	path.exists(filename, function(exists) {
		if(!exists) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();

			return;
		}

		if (fs.statSync(filename).isDirectory()) filename += 'index.html';

		fs.readFile(filename, "binary", function(err, file) {
			if(err) {        
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			}

			response.writeHead(200);
			response.write(file, "binary");
			response.end();
		});
	});
}


http.listen('9000');

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