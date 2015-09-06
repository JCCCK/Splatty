//game
var map;
var layer;
var mainTileLayer;
var splatterTileLayer;

//players
var players = []; //array of all players in session
var playerSprites = []; //array of all player sprite
var PLAYER_MAX = 16; //max number of players that can be in the game

//this player
var facing = 'left';
var jumpTimer = 0;
var background;

//this player's shooting stuff
var bullets;
var fireRate = 200;
var nextFire = 0;

//keys
var cursors;
var spacebar;
var aKey;
var wKey;
var sKey;
var dKey;

//gamepad
var pad1;
var pad2;
var pad3;
var pad4;
var indicator;

//sounds
var jump_up;
var jump_land;

function create(){
    //init physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 500;

    //init background
    game.stage.backgroundColor = '#000000';
    background = game.add.tileSprite(0, 0, 800, 600, 'background');
    background.fixedToCamera = true;

    //gamepad
    game.input.gamepad.start();
    pad1 = game.input.gamepad.pad1;
    pad2 = game.input.gamepad.pad2;
    pad3 = game.input.gamepad.pad3;
    pad4 = game.input.gamepad.pad4;

    //sounds
    jump_up = game.add.audio('jump_up');
    jump_land = game.add.audio('jump_land');

    //init buttons
    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

    //init tilemap
    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles-default');
    map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);
    mainTileLayer = map.createLayer('Tile Layer 1');
    mainTileLayer.resizeWorld();

    map.addTilesetImage('tiles-dark-blue');
    map.addTilesetImage('tiles-green');
    map.addTilesetImage('tiles-light-blue');
    map.addTilesetImage('tiles-purple');

    splatterTileLayer = map.createBlankLayer('Tile Layer 2', 64, 64, 16, 16);


    //Un-comment this on to see the collision tiles
    //layer.debug = true;



    //shooting
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    bullets.createMultiple(50, 'bullet0');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);

    //players
    for(var i = 0; i < PLAYER_MAX; i++){
        var spriteNumber = i % 4;
            console.log(spriteNumber);
            var spritePath = 'dude' + spriteNumber;
            console.log(spritePath);
        playerSprites[i] = game.make.sprite(32, 32, spritePath);
    }



    function addPlayer(data){
        console.log(data);
        var p_id = data.playerID;
        game.physics.arcade.collide(players, mainTileLayer);
        console.log(p_id);
        if(sessionID != p_id){
            console.log("init!")
            players[p_id] = game.add.existing(playerSprites[p_id]);
            game.physics.enable(players[p_id], Phaser.Physics.ARCADE);
            players[p_id].body.collideWorldBounds = true;
            players[p_id].body.setSize(20, 32, 5, 16);
            players[p_id].animations.add('left', [0, 1, 2, 3], 10, true);
            players[p_id].animations.add('turn', [4], 20, true);
            players[p_id].animations.add('right', [5, 6, 7, 8], 10, true);
            players[p_id].x = data.position.x;
            players[p_id].y = data.position.y;
            //spawn in offscreen, then wait for positional update
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

    //socket stuff
    socket.on('initialize', function(data){
        console.log(data);
        sessionID = data.playerID;
        console.log("sessionid = " + sessionID)
        for (var i in data.p_list){
            if (data.p_list[i]){
                var initPlayerData = {
                    position: data.posList[i],
                    playerID: i
                }
                addPlayer(initPlayerData);
            }
        }
        initializeSelf();
        var initPackage = {
            playerID: sessionID,
            position: players[sessionID].body.position
        }
        socket.emit('newPlayer', initPackage);
        console.log("initialized");
    });

    socket.on('newPlayerwithPos', function(data) {
        console.log("newPlayerAdded")
        addPlayer(data);
    });

    socket.on('jettison', function(data) {
        console.log(data);
        players[data].kill();
    });




}
