var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'gameDiv', { preload: preload, create: create, update: update, render: render });
var socket = io.connect('localhost:5000');
var sessionID = 0;
socket.on('connect', function (data) {
    console.log(data);
    sessionID = data;
    console.log(sessionID);
});
var UiPlayers = document.getElementById("players");
socket.on('count', function (data) {
      UiPlayers.innerHTML = 'Players: ' + data['playerCount'];
});

function preload() {
    game.load.tilemap('level1', '/resources/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', '/resources/tiles-1.png');
    game.load.spritesheet('dude0', '/resources/dude.png', 32, 48);
    game.load.spritesheet('dude1', '/resources/dude2.png', 32, 48);
    game.load.spritesheet('dude2', '/resources/dude3.png', 32, 48);
    game.load.spritesheet('dude3', '/resources/dude4.png', 32, 48);
    game.load.spritesheet('droid', '/resources/droid.png', 32, 32);
    game.load.image('starSmall', '/resources/star.png');
    game.load.image('starBig', '/resources/star2.png');
    game.load.image('background', '/resources/background2.png');
    game.load.image('bullet', '/resources/purple_ball.png');
}

var map;
var tileset;
var layer;
var players = []; //array of all players in session
var playerSprites = []; //array of all player sprite
var PLAYER_MAX = 4; //max number of players that can be in the game
var mainTileLayer;
var splatterTileLayer;
var facing = 'left';
var jumpTimer = 0;
var background;

//keys
var cursors;
var spacebar;
var aKey;
var wKey;
var sKey;
var dKey;

//shooting stuff
var bullets;
var fireRate = 200;
var nextFire = 0;

function create(){

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';

    background = game.add.tileSprite(0, 0, 800, 600, 'background');
    background.fixedToCamera = true;

    map = game.add.tilemap('level1');

    map.addTilesetImage('tiles-1');

    map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);

    mainTileLayer = map.createLayer('Tile Layer 1');

    //  Un-comment this on to see the collision tiles
    // layer.debug = true;

    mainTileLayer.resizeWorld();

    game.physics.arcade.gravity.y = 500;

    //shooting
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    bullets.createMultiple(50, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);

    //PLAYERS
    for(var i = 0; i < PLAYER_MAX; i++){
        var spritePath = i % 4;
            console.log(spritePath);
            spritePath = 'dude' + spritePath;
            console.log(spritePath);
        playerSprites[i] = game.make.sprite(32, 32, spritePath);
    }

    function addPlayer(p_id){
        console.log(p_id);
        if(sessionID != p_id){
            players[p_id] = game.add.existing(playerSprites[p_id]);
            game.physics.enable(players[p_id], Phaser.Physics.ARCADE);
            players[p_id].body.collideWorldBounds = true;
            players[p_id].body.setSize(20, 32, 5, 16);
            players[p_id].animations.add('left', [0, 1, 2, 3], 10, true);
            players[p_id].animations.add('turn', [4], 20, true);
            players[p_id].animations.add('right', [5, 6, 7, 8], 10, true);
        }
    }

    function initializeSelf(){
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

    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);


    socket.on('initialize', function(data){
        console.log(data);
        sessionID = data.id;
        for (i in data.p_list){
            if (data.p_list[i]){
                addPlayer(i);
            }
        }
        initializeSelf();
        socket.emit('newPlayer', sessionID);
        console.log("initialized");
    });

    socket.on('newPlayerwithPos', function(data) {
        console.log("newPlayerAdded")
        var obj = data;
        addPlayer(data);
    });

}

function update(){
    game.physics.arcade.collide(players, layer);
    game.physics.arcade.collide(bullets, layer);
    game.physics.arcade.collide(bullets, mainTileLayer, function(bullet, mainTileLayer) {
        bullet.kill();
    });

    if (!(players[sessionID] === undefined)){
            players[sessionID].body.velocity.x = 0;
            game.physics.arcade.collide(players[sessionID], mainTileLayer);
        if (cursors.left.isDown || aKey.isDown) {
            players[sessionID].body.velocity.x = -150;

            // if (facing != 'left') {
            //     players[sessionID].animations.play('left');
            //     facing = 'left';
            // }
        }
        else if (cursors.right.isDown || dKey.isDown) {
            players[sessionID].body.velocity.x = 150;

            // if (facing != 'right') {
            //     players[sessionID].animations.play('right');
            //     facing = 'right';
            // }
        }
        else {
            if (facing != 'idle') {
                players[sessionID].animations.stop();

                if (facing == 'left') {
                    players[sessionID].frame = 0;
                }
                else {
                    players[sessionID].frame = 5;
                }

                facing = 'idle';
            }
        }

        if ((spacebar.isDown || cursors.up.isDown || wKey.isDown) && players[sessionID].body.onFloor() && game.time.now > jumpTimer) {
            players[sessionID].body.velocity.y = -300;
            jumpTimer = game.time.now + 750;
        }

        if (game.input.activePointer.isDown) {
            fire();
        }
            //send new positional impulse data
        var impulse = players[sessionID].body.velocity;
        var vector = {
             sessionID: sessionID;
             impulse: players[sessionID].body.velocity
        }
        socket.emit('playerImpulse', vector);
    }

    //grab new players

    socket.on('updatedImpulse', function(data){
        var i = data.sessionID;
    });

    if (game.input.activePointer.isDown) {
        fire();
    }

}

function fire() {
    if (game.time.now > nextFire && bullets.countDead() > 0 && (!(players[sessionID] === undefined))) {
        nextFire = game.time.now + fireRate;
        var bullet = bullets.getFirstDead();
        bullet.reset(players[sessionID].x + 10, players[sessionID].y + 20);
        game.physics.arcade.moveToPointer(bullet, 700);
    }

}

function render (){
    if  (players[sessionID] === undefined){

    } else {
        if (game.input.x < players[sessionID].x - game.camera.x) {
            if (facing != 'left') {
                players[sessionID].animations.play('left');
                facing = 'left';
            }
        }
        else {
            if (facing != 'right') {
                players[sessionID].animations.play('right');
                facing = 'right';
            }
        }
    }

    // game.debug.text(game.time.physicsElapsed, 32, 32);
    // game.debug.body(player);
    // game.debug.bodyInfo(player, 16, 24);

}
