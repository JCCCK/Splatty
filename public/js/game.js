const SOCKET_URL = 'localhost:5000';
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GRAVITY = 500;
const MOVE_VELOCITY = 150;
const JUMP_VELOCITY = 320;
const JUMP_INTERVAL = 750;
const BULLET_SPEED = 700;
const SHOOT_INTERVAL = 200;
const GAMEPAD_DEADZONE = 0.1;
const UI_MARGIN_WIDTH = 16;

const PLAYER_SIZE = {
  width: 20,
  height: 32,
  offsetX: 5,
  offsetY: 16
};

const SCOREBOARD_SIZE = {
  width: 300,
  height: 300
};

const bulletLayerIds = {
  'bullet-blue': 1,
  'bullet-green': 2,
  'bullet-pink': 3,
  'bullet-purple': 4
};

var _socket;

// Tiles and Layers
var _tilemap;
var _mainLayer;
var _splatterLayer;

// Entities
var _mySprite;
var _myBullets;
var _otherPlayers = [];

// Teams
var _teams;

// Timers
var _nextJumpTime = 0,
  _nextShootTime = 0;

// Controls
var _cursors, _spacebar, _aKey, _wKey, _sKey, _dKey, _gamepad;

// Sounds
var _jumpSound, _landSound, _splashSound, _shootSound;

// Text
var _playersText;
var _scoreboardText;

var _game = new Phaser.Game(
  GAME_WIDTH,
  GAME_HEIGHT,
  Phaser.CANVAS,
  'game-container',
  {
    preload: preload,
    create: create,
    update: update
  }
);

// =============================================================================
// Preload
// =============================================================================
function preload() {
  this.stage.disableVisibilityChange = true;
  loadImages();
  loadSprites();
  loadTilemaps();
  loadAudio();
}

function loadImages() {
  _game.load.image('background', '/resources/background.png');
  _game.load.image('tiles-default', '/resources/level/tiles/tiles-default.png');
  _game.load.image('tiles-blue', '/resources/level/tiles/tiles-blue.png');
  _game.load.image('tiles-green', '/resources/level/tiles/tiles-green.png');
  _game.load.image('tiles-pink', '/resources/level/tiles/tiles-pink.png');
  _game.load.image('tiles-purple', '/resources/level/tiles/tiles-purple.png');
  _game.load.image('bullet-blue', '/resources/bullets/bullet-blue.png');
  _game.load.image('bullet-green', '/resources/bullets/bullet-green.png');
  _game.load.image('bullet-pink', '/resources/bullets/bullet-pink.png');
  _game.load.image('bullet-purple', '/resources/bullets/bullet-purple.png');
  _game.load.image('controllerconnected', '/resources/gun.png');
}

function loadSprites() {
  _game.load.spritesheet(
    'player-blue',
    '/resources/players/player-blue.png',
    32,
    48
  );
  _game.load.spritesheet(
    'player-green',
    '/resources/players/player-green.png',
    32,
    48
  );
  _game.load.spritesheet(
    'player-pink',
    '/resources/players/player-pink.png',
    32,
    48
  );
  _game.load.spritesheet(
    'player-purple',
    '/resources/players/player-purple.png',
    32,
    48
  );
}

function loadTilemaps() {
  _game.load.tilemap(
    'level_1',
    '/resources/level/map.json',
    null,
    Phaser.Tilemap.TILED_JSON
  );
}

function loadAudio() {
  _game.load.audio('jump_up', '/resources/sounds/jump_up.wav');
  _game.load.audio('jump_land', '/resources/sounds/jump_land.wav');
  _game.load.audio('splash', '/resources/sounds/splash.wav');
  _game.load.audio('shoot', '/resources/sounds/shoot.wav');
  _game.load.audio('background-music', '/resources/music/arcade-game-loop.mp3');
}

// =============================================================================
// Create
// =============================================================================
function create() {
  setupPhysics();
  setupBackground();
  setupSounds();
  setupControls();
  setupTilemaps();
  setupUi();
  setupSocket();
}

function setupPhysics() {
  _game.physics.startSystem(Phaser.Physics.ARCADE);
  _game.physics.arcade.gravity.y = GRAVITY;
}

function setupBackground() {
  _game.stage.backgroundColor = '#000000';
  var background = _game.add.tileSprite(
    0,
    0,
    GAME_WIDTH,
    GAME_HEIGHT,
    'background'
  );
  background.fixedToCamera = true;
}

function setupSounds() {
  _jumpSound = _game.add.audio('jump_up', 0.15);
  _landSound = _game.add.audio('jump_land');
  _splashSound = _game.add.audio('splash', 0.5);
  _shootSound = _game.add.audio('shoot', 0.25);
  backgroundMusic = _game.add.audio('background-music', 0.2, true);
  backgroundMusic.play();
}

function setupControls() {
  _cursors = _game.input.keyboard.createCursorKeys();
  _spacebar = _game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  _aKey = _game.input.keyboard.addKey(Phaser.Keyboard.A);
  _wKey = _game.input.keyboard.addKey(Phaser.Keyboard.W);
  _dKey = _game.input.keyboard.addKey(Phaser.Keyboard.D);
  _game.input.gamepad.start();
  _gamepad = _game.input.gamepad.pad1;
}

function setupTilemaps() {
  _tilemap = _game.add.tilemap('level_1');
  _tilemap.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);
  _tilemap.addTilesetImage('tiles-default');
  _tilemap.addTilesetImage('tiles-blue');
  _tilemap.addTilesetImage('tiles-green');
  _tilemap.addTilesetImage('tiles-pink');
  _tilemap.addTilesetImage('tiles-purple');

  // Main layer
  _mainLayer = _tilemap.createLayer('Main Layer');
  _mainLayer.resizeWorld();

  // Splatter Layer
  _splatterLayer = _tilemap.createBlankLayer(
    'Splatter Layer',
    120,
    120,
    16,
    16
  );
}

function createPlayerBullets(bulletSpriteName) {
  var bullets = _game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(25, bulletSpriteName);
  bullets.setAll('checkWorldBounds', true);
  bullets.setAll('outOfBoundsKill', true);
  return bullets;
}

function setupUi() {
  _playersText = _game.add.text(
    UI_MARGIN_WIDTH,
    UI_MARGIN_WIDTH,
    'Players: 0',
    {
      fontSize: '16px',
      fill: '#fff'
    }
  );
  _playersText.fixedToCamera = true;

  _scoreboardText = _game.add.text(
    0,
    0,
    `Blue Team: 0
    Green Team: 0
    Pink Team: 0
    Purple Team: 0`,
    {
      fontSize: '16px',
      fill: '#fff',
      align: 'right',
      boundsAlignH: 'right',
      boundsAlignV: 'top'
    }
  );
  _scoreboardText.setTextBounds(
    GAME_WIDTH - UI_MARGIN_WIDTH - SCOREBOARD_SIZE.width,
    UI_MARGIN_WIDTH,
    SCOREBOARD_SIZE.width,
    SCOREBOARD_SIZE.height
  );
  _scoreboardText.fixedToCamera = true;

  _playersText.fixedToCamera = true;
}

function setupSocket() {
  _socket = io(SOCKET_URL);
  _socket.on('connect', onConnect);
  _socket.on('disconnect', onDisconnect);
  _socket.on('game_state', onGameState);
  _socket.on('player_join', onPlayerJoin);
  _socket.on('server_update', onServerUpdate);
  _socket.on('tile_hit', onTileHit);
  _socket.on('player_leave', onPlayerLeave);
}

// =============================================================================
// Update
// =============================================================================
function update() {
  // Check collisions
  _game.physics.arcade.collide(_mySprite, _mainLayer);
  _game.physics.arcade.collide(
    _otherPlayers.map(player => player.sprite),
    _mainLayer
  );
  _game.physics.arcade.collide(_myBullets, _mainLayer, onBulletCollideWithTile);
  var otherBullets = _otherPlayers
    .map(player => player.bullets.children)
    .concat();
  _game.physics.arcade.collide(
    otherBullets,
    _mainLayer,
    onBulletCollideWithTile
  );

  if (!_mySprite) {
    return;
  }

  // Movement
  if (rightKeyPressed() && !leftKeyPressed()) {
    _mySprite.body.velocity.x = MOVE_VELOCITY;
  } else if (leftKeyPressed() && !rightKeyPressed()) {
    _mySprite.body.velocity.x = -MOVE_VELOCITY;
  } else {
    _mySprite.body.velocity.x = 0;
  }

  // Facing and animations
  var facing;
  if (usingGamepad()) {
    var xVelocity = _mySprite.body.velocity.x;
    if (xVelocity > 0) {
      facing = 'right';
    } else if (xVelocity < 0) {
      facing = 'left';
    }
  } else {
    facing = mouseLeftOfPlayer() ? 'left' : 'right';
  }

  if (facing) {
    animatePlayer(_mySprite, facing);
  }

  // Jumping
  if (jumpKeyPressed() && allowedToJump(_mySprite)) {
    jump(_mySprite);
    _nextJumpTime = _game.time.now + JUMP_INTERVAL;
  }

  // Shooting
  if (shootKeyPressed() && allowedToShoot()) {
    shootGun(_mySprite);
    _nextShootTime = _game.time.now + SHOOT_INTERVAL;
  }

  var body = createBodyData(_mySprite, facing);
  var bullets = createBulletsData(_myBullets.children);

  _socket.emit('player_update', { body, bullets });
}

function animatePlayer(sprite, facing) {
  var movingInX = Math.abs(sprite.body.velocity.x) > 0;
  if (movingInX) {
    if (facing == 'left') {
      var leftAnimation = sprite.animations.getAnimation('left');
      if (!leftAnimation.isPlaying) {
        sprite.animations.stop();
        leftAnimation.play('left');
      }
    } else if (facing == 'right') {
      var rightAnimation = sprite.animations.getAnimation('right');
      if (!rightAnimation.isPlaying) {
        sprite.animations.stop();
        rightAnimation.play('right');
      }
    }
  } else {
    sprite.animations.stop();
    sprite.frame = facing == 'left' ? 0 : 5;
  }
}

function jump(player) {
  player.body.velocity.y = -JUMP_VELOCITY;
  _jumpSound.play();
}

function shootGun(player) {
  var bullet = _myBullets.getFirstDead();
  bullet.reset(player.x + 10, player.y + 20);

  var rightStickX1 = _gamepad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X);
  var rightStickY1 = _gamepad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y);
  if (rightStickX1 || rightStickY1) {
    var angleToShoot = Math.atan2(rightStickY1, rightStickX1);
    bullet.body.velocity.x = Math.cos(angleToShoot) * BULLET_SPEED;
    bullet.body.velocity.y = Math.sin(angleToShoot) * BULLET_SPEED;
  } else {
    _game.physics.arcade.moveToPointer(bullet, BULLET_SPEED);
  }

  _shootSound.play();
}

function onBulletCollideWithTile(bullet, mainTileLayer) {
  bullet.kill();
  _splashSound.play();
  var teamName = _teams.find(team => team.bulletSpriteName == bullet.key).name;
  setSplatterTile(mainTileLayer.x, mainTileLayer.y, teamName);

  _socket.emit('tile_hit', {
    position: {
      x: mainTileLayer.x,
      y: mainTileLayer.y
    },
    teamName
  });
}

// =============================================================================
// Socket Events
// =============================================================================
function onConnect(socket) {
  console.log('Connected to socket!');
  console.log(`My socket id is '${_socket.id}'.`);
}

function onDisconnect(reason) {
  console.log('Disconnected from socket.');
  _otherPlayers.forEach(player => player.sprite.destroy());
  _otherPlayers.forEach(player =>
    player.bullets.children.forEach(bullet => bullet.destroy())
  );
  _otherPlayers = [];
  updatePlayersText();
}

function onGameState(gameState) {
  // Update scoreboard
  _teams = gameState.teams;
  updateScoreboardText();

  // Create other players
  gameState.players.forEach(addNewPlayer);
  var playerCount = gameState.players.length;
  var players = gameState.players.map(player => `'${player.id}'`).join(',');
  console.log(
    playerCount > 0
      ? `There are ${playerCount} other players: ${players}.`
      : 'There are no other players.'
  );

  // Create hit tiles
  for (var key in gameState.hitTiles) {
    var pos = key.split('+');
    var teamName = gameState.hitTiles[key];
    setSplatterTile(pos[0], pos[1], teamName);
  }

  // Create self
  var myTeamName = gameState.yourTeam;
  var myTeam = _teams.find(team => team.name == myTeamName);
  _myBullets = createPlayerBullets(myTeam.bulletSpriteName);
  _mySprite = createPlayerSprite(32, 32, myTeam.playerSpriteName);
  _game.camera.follow(_mySprite);
  updatePlayersText();

  // Tell server about ourself
  var body = createBodyData(_mySprite, 'right');
  var bullets = createBulletsData(_myBullets.children);
  _socket.emit('player_ready', { body, bullets });
}

function onPlayerJoin(playerData) {
  console.log(`Player '${playerData.id}' joined.`);
  addNewPlayer(playerData);
}

function addNewPlayer(playerData) {
  var playerTeamName = playerData.team;
  var playerTeam = _teams.find(team => team.name == playerTeamName);
  var bullets = createPlayerBullets(playerTeam.bulletSpriteName);
  var sprite = createPlayerSprite(
    playerData.body.position.x,
    playerData.body.position.y,
    playerTeam.playerSpriteName
  );
  var newPlayer = {
    id: playerData.id,
    sprite,
    bullets
  };
  _otherPlayers.push(newPlayer);
  updatePlayersText();
}

function onServerUpdate(updatesData) {
  for (var updateData of updatesData) {
    // Ignore our own data
    if (updateData.id == this.id) {
      continue;
    }

    var player = findPlayerById(updateData.id);
    if (!player) {
      return;
    }

    var sprite = player.sprite;
    sprite.x = updateData.body.position.x;
    sprite.y = updateData.body.position.y;
    sprite.body.velocity.x = updateData.body.velocity.x;
    sprite.body.velocity.y = updateData.body.velocity.y;

    animatePlayer(sprite, updateData.body.facing);

    for (var i = 0; i < updateData.bullets.length; i++) {
      var bullet = player.bullets.children[i];
      if (updateData.bullets[i].alive) {
        // TODO: Why do I need this?
        bullet.reset(0, 0);
        bullet.x = updateData.bullets[i].position.x;
        bullet.y = updateData.bullets[i].position.y;
        bullet.body.velocity.x = updateData.bullets[i].velocity.x;
        bullet.body.velocity.y = updateData.bullets[i].velocity.y;
      } else {
        if (bullet.alive) {
          bullet.kill();
        }
      }
    }
  }
}

function onTileHit(hitData) {
  setSplatterTile(
    hitData.tileData.position.x,
    hitData.tileData.position.y,
    hitData.tileData.teamName
  );
  _teams = hitData.teamData;
  updateScoreboardText();
}

function onPlayerLeave(playerData) {
  var player = findPlayerById(playerData.id);
  if (!player) {
    return;
  }

  player.sprite.destroy();
  player.bullets.children.forEach(bullet => bullet.destroy());
  _otherPlayers.splice(_otherPlayers.indexOf(player), 1);
  updatePlayersText();

  console.log(`Player '${playerData.id}' left.`);
}

function createBodyData(playerSprite, facing) {
  return {
    facing: facing,
    position: {
      x: playerSprite.x,
      y: playerSprite.y
    },
    velocity: {
      x: playerSprite.body.velocity.x,
      y: playerSprite.body.velocity.y
    }
  };
}

function createBulletsData(bulletSprites) {
  var bulletsData = [];
  for (var bulletSprite of bulletSprites) {
    bulletsData.push({
      alive: bulletSprite.alive,
      position: {
        x: bulletSprite.x,
        y: bulletSprite.y
      },
      velocity: {
        x: bulletSprite.body.velocity.x,
        y: bulletSprite.body.velocity.y
      }
    });
  }
  return bulletsData;
}

function createPlayerSprite(xPos, yPos, playerSpriteName) {
  var player = _game.add.sprite(xPos, yPos, playerSpriteName);
  _game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.collideWorldBounds = true;
  player.body.setSize(
    PLAYER_SIZE.width,
    PLAYER_SIZE.height,
    PLAYER_SIZE.offsetX,
    PLAYER_SIZE.offsetY
  );
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('turn', [4], 20, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);
  return player;
}

function findPlayerById(id) {
  return _otherPlayers.find(otherPlayer => otherPlayer.id == id);
}

function updatePlayersText() {
  _playersText.text = `Players: ${_otherPlayers.length + 1}`;
}

function updateScoreboardText() {
  _teams.sort((a, b) => b.score - a.score);
  var scoreboardLines = [];
  for (var team of _teams) {
    scoreboardLines.push(`${team.name} Team: ${team.score}`);
  }
  _scoreboardText.text = scoreboardLines.join('\n');
}

function setSplatterTile(xPos, yPos, teamName) {
  var teamLayerIndex = _teams.find(team => (team.name == teamName)).layerIndex;
  var changeFactor = teamLayerIndex * 100;
  var tileIndex = _tilemap.getTile(xPos, yPos, _mainLayer).index;
  var newTileIndex = tileIndex + changeFactor;
  _tilemap.putTile(newTileIndex, xPos, yPos, _splatterLayer);
}

// =============================================================================
// Controls
// =============================================================================
function rightKeyPressed() {
  return (
    _cursors.right.isDown ||
    _dKey.isDown ||
    _gamepad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) ||
    _gamepad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > GAMEPAD_DEADZONE
  );
}

function leftKeyPressed() {
  return (
    _cursors.left.isDown ||
    _aKey.isDown ||
    _gamepad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) ||
    _gamepad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -GAMEPAD_DEADZONE
  );
}

function jumpKeyPressed() {
  return (
    _cursors.up.isDown ||
    _wKey.isDown ||
    _spacebar.isDown ||
    _gamepad.justPressed(Phaser.Gamepad.XBOX360_A) ||
    _gamepad.isDown(Phaser.Gamepad.XBOX360_LEFT_TRIGGER) ||
    _gamepad.isDown(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER) ||
    _gamepad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP)
  );
}

function shootKeyPressed() {
  var rightStickX1 =
    Math.abs(_gamepad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X)) >
    GAMEPAD_DEADZONE;
  var rightStickY1 =
    Math.abs(_gamepad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y)) >
    GAMEPAD_DEADZONE;
  return _game.input.activePointer.isDown || rightStickX1 || rightStickY1;
}

function mouseLeftOfPlayer() {
  return (
    _game.input.x <
    _mySprite.x + PLAYER_SIZE.width / 2 + PLAYER_SIZE.offsetX - _game.camera.x
  );
}

function usingGamepad() {
  return (
    _game.input.gamepad.supported &&
    _game.input.gamepad.active &&
    _gamepad.connected
  );
}

function allowedToJump(player) {
  return player.body.onFloor() && _game.time.now > _nextJumpTime;
}

function allowedToShoot() {
  return _game.time.now > _nextShootTime && _myBullets.countDead() > 0;
}
