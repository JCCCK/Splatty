const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = 5000;
const UPDATE_INTERVAL = 10;

var _gameState = {
  players: [],
  hitTiles: {},
  teams: [
    {
      name: 'Blue',
      playerSpriteName: 'player-blue',
      bulletSpriteName: 'bullet-blue',
      layerIndex: 1,
      score: 0
    },
    {
      name: 'Green',
      playerSpriteName: 'player-green',
      bulletSpriteName: 'bullet-green',
      layerIndex: 2,
      score: 0
    },
    {
      name: 'Pink',
      playerSpriteName: 'player-pink',
      bulletSpriteName: 'bullet-pink',
      layerIndex: 3,
      score: 0
    },
    {
      name: 'Purple',
      playerSpriteName: 'player-purple',
      bulletSpriteName: 'bullet-purple',
      layerIndex: 4,
      score: 0
    }
  ]
};

io.on('connection', socket => {
  socket.on('player_ready', onPlayerReady);
  socket.on('player_update', onPlayerUpdate);
  socket.on('tile_hit', onTileHit);
  socket.on('disconnect', onDisconnect);

  console.log(`Player '${socket.id}' connected.`);
  // Send the game state to the new player
  var gameState = _gameState;
  gameState.yourTeam = getTeamToAddPlayer();
  socket.emit('game_state', gameState);
});

app.set('port', process.env.PORT || PORT);
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render('pages/index');
});

function findPlayerById(id) {
  return _gameState.players.find(player => player.id == id);
}

function getTeamToAddPlayer() {
  var lowestCount = 0;
  var lowestTeam;
  for (var team of _gameState.teams) {
    var numPlayers = _gameState.players.filter(
      player => player.team == team.name
    ).length;
    if (!lowestTeam || numPlayers < lowestCount) {
      lowestCount = numPlayers;
      lowestTeam = team.name;
    }
  }
  return lowestTeam;
}

function onPlayerReady(playerData) {
  // Add the new player
  var newPlayer = {
    id: this.id,
    team: getTeamToAddPlayer(),
    body: playerData.body,
    bullets: playerData.bullets
  };
  _gameState.players.push(newPlayer);

  // Tell other players
  this.broadcast.emit('player_join', newPlayer);
}

function onPlayerUpdate(updateData) {
  // Find the player
  var player = findPlayerById(this.id);
  if (!player) {
    return;
  }

  // Update the player
  player.body = updateData.body;
  player.bullets = updateData.bullets;
  player.updateSent = false;
}

function onTileHit(tileData) {
  // Check if the new team exists
  var newTeam = _gameState.teams.find(team => team.name == tileData.teamName);
  if (!newTeam) {
    return;
  }

  // Check if the tile is new or a different value
  var tilePos = `${tileData.position.x}+${tileData.position.y}`;
  var oldTileValue = _gameState.hitTiles[tilePos];
  if (oldTileValue == newTeam.name) {
    return;
  }

  // Update the hit tiles
  _gameState.hitTiles[tilePos] = newTeam.name;
  newTeam.score++;

  if (oldTileValue) {
    var oldTeam = _gameState.teams.find(team => team.name == oldTileValue);
    oldTeam.score--;
  }

  // Tell all players
  var teamData = _gameState.teams;
  io.emit('tile_hit', { teamData, tileData });
}

function onDisconnect() {
  // Remove player
  _gameState.players = _gameState.players.filter(
    player => player.id != this.id
  );

  // Reset game state if no players
  if (_gameState.players.length == 0) {
    _gameState.hitTiles = {};
    for (var team of _gameState.teams) {
      team.score = 0;
    }
  }

  // Tell other players
  this.broadcast.emit('player_leave', { id: this.id });

  console.log(`Player '${this.id}' disconnected.`);
}

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

setInterval(() => {
  var newUpdates = _gameState.players.filter(player => !player.updateSent);
  io.sockets.emit('server_update', newUpdates);
  _gameState.players.forEach(player => (player.updateSent = true));
}, UPDATE_INTERVAL);
