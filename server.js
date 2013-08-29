var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server, { log: false }),
	port = 9000;

//Start listening to the port
server.listen(port);

//Directories that would be serve on the server
app.use("/css", express.static(__dirname + '/webapp/css'));
app.use("/js", express.static(__dirname + '/webapp/js'));
app.use("/img", express.static(__dirname + '/webapp/img'));

//Main page of the server
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/webapp/index.html');
});

//Serve 404 - Page not founds
app.get('*', function(req, res){
  res.send('Page not found - 404', 404);
});

//If not support websockets
io.set('transports', [ 'websocket', 'xhr-polling' ]);

log('Server running on port: ' + port);

//User List
var users = {};

io.sockets.on('connection', function(socket){
	//Detect socket when you connect
	socket.on('connect', function(data){
		if( !users[data.nickname] ){
			//Save user on the Array
			users[data.nickname] = new chatUser(data.nickname, socket.id);

			//Send broadcast of connection
			socket.broadcast.emit('user_connect', {'nickname' : data.nickname});
			socket.emit('connect_success', {'nickname' : data.nickname});
			socket.emit('user_list', getUsersOnline());

			log(data.nickname + ' just connect');
		}else{
			//If user with same nickname connected, disconnect
			socket.emit('already_exist', {'nickname' : data.nickname});
			socket.disconnect();

			log(data.nickname + ' is already used');
		}
	});

	//Send message trough sockets
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

				//Remove the user from the Array
				delete users[key];
			}
		}
	});
});

function getUsersOnline(){
	var usersOnline = {};

	for (key in users){
		usersOnline[key] = true;
	}

	return usersOnline
}

//User Class
function chatUser(nickname, socketId){
	this.nickname = nickname;
	this.socketId = socketId;
}

//Log function
function log(logMessage){
	console.log(logMessage);
}