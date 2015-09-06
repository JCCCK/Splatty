var express = require('express'),
    io = require('socket.io'),
    app = express(),
    http = require('http'),
    path = require('path'),
    Game = require('./game.js')
    server = require('http').Server(app),
    io = require('socket.io')(server);

var playerCount = 0;
var playerList = [];
var impulseQueue = [];
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
    console.log(playerList);
    if(playerList.length == 0){
        console.log("noplayers!");
        playerList[0] = true;
        return 0;
    } else{
        for(var i = 0; i < playerList.length; i++){
            console.log(i);
            if(playerList[i] == false){
                console.log(i);
                playerList[i] = true;
                console.log(playerList[i])
                return i;
            }
        }
    }
}

io.on('connection', function (socket) {
  var id = addNewPlayer();
  console.log(id);
  playerCount++;
  setTimeout(function () {
    socket.emit('connect', id);
    io.emit('count', { playerCount: playerCount });

    socket.emit('initialize', {id: id,
                               p_list: playerList});

    socket.on('newPlayer', function(data){
        io.emit('newPlayerwithPos', data)
    });
    socket.on('playerImpulse', function(data){
        console.log("pushingQueue!");
        impulseQueue.push(data);
        console.log("clearingQueue!");
        for(i in impulseQueue){
            k = impulseQueue[i];
            console.log(k);
            io.emit('updatedImpulse', k);
            impulseQueue.shift();
        }
    });
  }, 1500);

  socket.on('disconnect', function(){
    playerCount--;
    playerList.shift();
    io.emit('count', { playerCount: playerCount });
  });
});
