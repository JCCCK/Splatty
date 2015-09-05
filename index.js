
var express = require('express'),
    io = require('socket.io'),
    http = require('http'),
    path = require('path'),
    Game = require('./game.js');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});


var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var sockets = io.listen(server);

var server = require('garageserver.io').createGarageServer(sockets, {/*options*/ });
server.start();

// Inside game loop ...
var players = server.getPlayers();

players.forEach(function (player) {
    var newState = {};
    if (!player.state.x) {
       player.state.x = 0;
    }
    for (i = 0; i < player.inputs.length; i ++) {
        if (player.inputs[i].input === 'left') {
            newState.x = player.state.x - (50 * deltaTime);
        } else if (inputs[i].input === 'right') {
            newState.x = player.state.x + (50 * deltaTime);
        }
    }
    server.updatePlayerState(player.id, newState);
});
