$(function (e, t){

	function chat(user, socket){
		_this = this;

		//Variables
		_this.socket = socket;
		this.user = new chatUser(user);
		this.users = {};

		//Emit Connection
		this.emmitConnection();

		//Bindings
		this.bindEvents();
		this.userConnect();
		this.messageRecieve();
	}

	chat.prototype.emmitMessage = function(nickname, message){
		_this.socket.emit('emit_message', { 'nickname' : nickname, 'message' : message });
	}

	chat.prototype.emmitConnection = function(){
		_this.socket.emit('connect', { 'nickname' : _this.user.nickname });
	}

	chat.prototype.userConnect = function(){
		_this.socket.on('user_connect', function(data){
			_this.users[data.nickname] = new chatUser(data.nickname);
		});
	}

	chat.prototype.messageRecieve = function(){
		_this.socket.on('user_message', function(data){
			_this.recieveMessage(data.nickname, data.message);
		});
	}

	chat.prototype.createMessageOnUI = function(user, message){
		var side = 'right',
			messageOnUI = false;

		if( user == _this.user.nickname ){
			side = 'left';
		}

		if( ($('#message-container .chat').size() > 0) ){
			var lastMessage = $('#message-container .chat').last();

			if( $(lastMessage).attr('user') == user ){
				$(lastMessage).find('div.message').append('<span class="text">' + message + '</span>');

				messageOnUI = true;
			}
		}

		if( !(messageOnUI) ){
			$('#message-container').append('<div class="chat ' + side + '" user="' + user + '"><div class="profilePic"><img src="img/unknown.png"/></div><div class="message"><span class="who">' + user + ':</span><span class="text">' + message + '</span></div></div>');
		}
	}

	chat.prototype.bindEvents = function(){
		$('#input-container input').focusin(function(event) {
			$('#input-container input').addClass('haveFocus');
		});

		$('#input-container input').focusout(function(event) {
			$('#input-container input').removeClass('haveFocus');
		});

		$(window).keydown(function(event){
			if( (event.keyCode == 13) && ($('#input-container input').hasClass('haveFocus')) ){
				event.preventDefault();

				_this.sendMessage();
			}
		})

		//Button Event to send the message
		$('#input-container button').click(function(){
			_this.sendMessage();
		});
	}

	chat.prototype.sendMessage = function(){
		var message = $('#input-container input').val();

		if( message != '' ){
			_this.createMessageOnUI(_this.user.nickname, message);
			_this.emmitMessage(_this.user.nickname, message);


			//Clean the input
			$('#input-container input').val('');

			//Scroll Down Automatically
			var objDiv = document.getElementById("message-container");

			objDiv.scrollTop = objDiv.scrollHeight;
		}
	}

	chat.prototype.recieveMessage = function(nickname, message){
		_this.createMessageOnUI(nickname, message);

		//Scroll Down Automatically
		var objDiv = document.getElementById("message-container");

		objDiv.scrollTop = objDiv.scrollHeight;
	}

	/* ------------- chatUser Class -------------- */
	function chatUser(nickname){
		this.nickname = nickname;
	}

	var socket = io.connect('http://127.0.0.1:9000');
	var user = prompt('Please enter your name: ');

	//Create the chat
	var chat = new chat(user, socket);
});