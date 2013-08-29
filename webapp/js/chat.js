$(function (e, t){

	function chat(){
		_this = this;

		//Ask for user name
		var user = prompt('Please enter your name: ');

		//Variables
		_this.socket = io.connect();
		this.user = new chatUser(user);
		this.users = {};
		this.logIn = false;

		//Bindings
		this.bindEvents();
		this.socketEvents();
	}

	chat.prototype.socketEvents = function(){
		//Emmit Connection
		_this.socket.on('connect', function(data){
	        _this.emmitConnection();
	    });

		//Detect a user connection
		_this.socket.on('user_connect', function(data){
			_this.users[data.nickname] = new chatUser(data.nickname);

			var message =  data.nickname + ' is connected';

			_this.notifications(message, 3);

			_this.addUserToList(data.nickname);
		});

		//Detect a user connection
		_this.socket.on('user_list', function(data){
			for (key in data){
				if( !(_this.users[key]) && (_this.user.nickname != key) ){
					_this.users[key] = new chatUser(key);
					_this.addUserToList(key);
				}
			}
		});

		//Detect a user disconnection
		_this.socket.on('user_disconnect', function(data){
			delete _this.users[data.nickname];

			var message =  data.nickname + ' just disconnect';

			_this.notifications(message, 3);

			_this.removeFromList(data.nickname);
		});

		//Detect server disconnection
		_this.socket.on('disconnect', function(data){
			if( _this.logIn ){
				var message =  'The server is down';

				_this.notifications(message, 3);

				_this.socket.socket.reconnect();
			}
		});

		//Log if user is connected successfully
		_this.socket.on('connect_success', function(data){
			var message =  'You are online';

			_this.notifications(message, 3);

			_this.logIn = true;
		});

		//Detect user forced to disconnect
		_this.socket.on('already_exist', function(data){
			alert('User already logged');

			var user = prompt('Please enter your name: ');

			_this.user.nickname = user;
			_this.socket.socket.reconnect();
		});

		_this.socket.on('user_message', function(data){
			_this.recieveMessage(data.nickname, data.message);
		});
	}

	chat.prototype.addUserToList = function(user){
		$('#users-container ul').append('<li user="' + user + '"><img src="img/unknown.png"></img><p>' + user + '</p></li>');
	}

	chat.prototype.removeFromList = function(user){
		$('#users-container ul li[user=' + user + ']').remove();
	}

	chat.prototype.notifications = function(message, type){
		$('#chat-container #notification-center').append('<div class="tn-box tn-box-color-' + type + '"><p>' + message + '</p><div class="tn-progress"></div></div>');

		$('.tn-box').last().addClass('play');

		//Append Event when finish
	    $('.tn-box').last().one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
		    $(this).remove();
	    });
	}

	chat.prototype.emmitConnection = function(){
		_this.socket.emit('connect', { 'nickname' : _this.user.nickname });
	}

	chat.prototype.emmitMessage = function(nickname, message){
		_this.socket.emit('emit_message', { 'nickname' : nickname, 'message' : message });
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

	//Create the chat
	var chat = new chat();

	window.chat = chat;
});