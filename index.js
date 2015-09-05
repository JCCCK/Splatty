
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

var game = new Game(sockets);
game.start();
