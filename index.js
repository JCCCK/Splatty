var express = require('express'),
    io = require('socket.io'),
    app = express(),
    http = require('http'),
    path = require('path'),
    Game = require('./game.js'),
    server = require('http').Server(app),
    io = require('socket.io')(server);

var playerCount = 1;
var playerList = [];
var playerPositions = [];
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
        playerList[0] = true;
        return 0;
    } else{
        for(var i = 0; i < playerList.length; i++){

            if(playerList[i] == false){
                console.log(i);
                playerList[i] = true;
                playerPositions[i] = {x: 32, y:32}
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

    socket.emit('initialize', {playerID: id,
                               p_list: playerList,
                               posList: playerPositions});

    socket.on('newPlayer', function(data){
        console.log("data:");
        console.log(data);
        socket.p_id = data.playerID;
        io.emit('newPlayerwithPos', data)
    });
    socket.on('playerImpulse', function(data){
        console.log("pushingQueue!");
        impulseQueue.push(data);
        console.log("clearingQueue!");
        for(i in impulseQueue){
            k = impulseQueue[i];
            console.log(k);
            playerPositions[k.playerID] = k.position;
            io.emit('updatedImpulse', k);
            impulseQueue.shift();
        }
    });
  }, 1500);

  socket.on('disconnect', function(){
    playerCount--;
    playerList[socket.p_id] = false;
    io.emit('count', { playerCount: playerCount });
  });
});
