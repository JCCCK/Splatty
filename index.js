var express = require('express'),
    io = require('socket.io'),
    app = express(),
    http = require('http'),
    path = require('path'),
    Game = require('./game.js'),
    server = require('http').Server(app),
    io = require('socket.io')(server);

var playerCount = 0;
var playerList = [];
var playerPositions = [];
var impulseQueue = [];
var bulletQueue = [];
for (var i = 0; i < 16; i++){
    playerList.push(false);
}

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});


server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function addNewPlayer(){
    for(var i = 0; i < playerList.length; i++){
        if(playerList[i] == false){
            playerList[i] = true;
            playerPositions[i] = {x: 32, y:32}
            return i;
        }
    }
}


io.on('connection', function (socket) {
  var id = addNewPlayer();
  playerCount++;
  setTimeout(function () {
    socket.emit('connect', id);
    io.emit('count', { playerCount: playerCount });

    socket.emit('initialize', {playerID: id,
                               p_list: playerList,
                               posList: playerPositions});
    socket.on('newPlayer', function(data){
        socket.p_id = data.playerID;
        io.emit('newPlayerwithPos', data)
    });
    socket.on('playerImpulse', function(data){
            k = data;
            playerPositions[k.playerID] = k.position;
            io.emit('updatedImpulse', k);
    });
    socket.on('bulletImpulse', function(data){
            k = data;
            io.emit('firedProjectile', k); 
    })
  }, 1500);

  socket.on('disconnect', function(){
    playerCount--;
    playerList[socket.p_id] = false;
    io.emit('count', { playerCount: playerCount });
  });
});
