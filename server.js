// server.js

var express = require('express');
var app = express();
var http = require('http').Server(app); 
var io = require('socket.io')(http);    
var path = require('path');

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	// 루트 페이지로 접속시 chat.pug 렌더링
	res.render('chat');
});

var count = 1;
var playerList = {};

// 채팅방에 접속했을 때 - 1
io.on('connection', function(socket){
	console.log('user connected: ', socket.id);
	var name = "익명" + count++;
	socket.name = name;

	playerList[socket.id] = {};
	playerList[socket.id].name = socket.name;

	io.to(socket.id).emit('create name', name);
    io.emit('new_connect', name, playerList);
	
	// 채팅방 접속이 끊어졌을 때 - 2
	socket.on('disconnect', function(){
		console.log('user disconnected: '+ socket.id + ' ' + socket.name);
		delete playerList[socket.id];
        io.emit('new_disconnect', socket.name, playerList);
	});
	
	// 메세지를 보냈을 때 - 3 
	socket.on('send message', function(name, text){
		var msg = name + ' : ' + text;
		// 닉네임을 바꿨을 때
		if(name != socket.name) {
			playerList[socket.id].name = name;
			io.emit('change name', socket.name, name);
		}
		socket.name = name;
    	console.log(msg);
    	io.emit('receive message', msg, playerList);
	});
	
});

http.listen(3000, function(){ 
	console.log('server on..');
});