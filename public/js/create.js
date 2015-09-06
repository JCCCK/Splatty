var map;
var tileset;
var layer;
var mainTileLayer;
var splatterTileLayer;
var players = [];
var playerSprites = [];
var PLAYER_MAX = 4;
var facing = 'left';
var jumpTimer = 0;
var background;
var bullets;
var fireRate = 200;
var nextFire = 0;
var cursors;
var spacebar;
var aKey;
var wKey;
var sKey;
var dKey;
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 500;
    game.stage.backgroundColor = '#000000';
    background = game.add.tileSprite(0, 0, 800, 600, 'background');
    background.fixedToCamera = true;
    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles-1');
    map.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);
    mainTileLayer = map.createLayer('Tile Layer 1');
    mainTileLayer.resizeWorld();
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(50, 'bullet0');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
    for (var i = 0; i < PLAYER_MAX; i++) {
        var spriteNumber = i % 4;
        console.log(spriteNumber);
        var spritePath = 'dude' + spriteNumber;
        console.log(spritePath);
        playerSprites[i] = game.make.sprite(32, 32, spritePath);
    }
    function addPlayer(p_id) {
        console.log(p_id);
        if (sessionID != p_id) {
            players[p_id] = game.add.existing(playerSprites[p_id]);
            game.physics.enable(players[p_id], Phaser.Physics.ARCADE);
            players[p_id].body.collideWorldBounds = true;
            players[p_id].body.setSize(20, 32, 5, 16);
            players[p_id].animations.add('left', [0, 1, 2, 3], 10, true);
            players[p_id].animations.add('turn', [4], 20, true);
            players[p_id].animations.add('right', [5, 6, 7, 8], 10, true);
        }
    }
    function initializeSelf() {
        console.log(sessionID);
        players[sessionID] = game.add.existing(playerSprites[sessionID]);
        game.physics.enable(players[sessionID], Phaser.Physics.ARCADE);
        players[sessionID].body.collideWorldBounds = true;
        players[sessionID].body.setSize(20, 32, 5, 16);
        players[sessionID].animations.add('left', [0, 1, 2, 3], 10, true);
        players[sessionID].animations.add('turn', [4], 20, true);
        players[sessionID].animations.add('right', [5, 6, 7, 8], 10, true);
        players[sessionID].x = 32;
        players[sessionID].y = 32;
        game.camera.follow(players[sessionID]);
    }
    socket.on('initialize', function (data) {
        console.log(data);
        sessionID = data.id;
        for (var i in data.p_list) {
            if (data.p_list[i]) {
                addPlayer(i);
            }
        }
        initializeSelf();
        socket.emit('newPlayer', sessionID);
        console.log("initialized");
    });
    socket.on('newPlayerwithPos', function (data) {
        console.log("newPlayerAdded");
        var obj = data;
        addPlayer(data);
    });
}
