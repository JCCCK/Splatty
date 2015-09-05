var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'gameDiv', { preload: preload, create: create, update: update, render: render });
var socket = io.connect('http://localhost:5000');
var UiPlayers = document.getElementById("players");
socket.on('count', function (data) {
    UiPlayers.innerHTML = 'Players: ' + data['playerCount'];
});
function preload() {
    game.load.tilemap('level1', '/resources/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', '/resources/tiles-1.png');
    game.load.spritesheet('dude', '/resources/dude.png', 32, 48);
    game.load.spritesheet('droid', '/resources/droid.png', 32, 32);
    game.load.image('starSmall', '/resources/star.png');
    game.load.image('starBig', '/resources/star2.png');
    game.load.image('background', '/resources/background2.png');
    game.load.image('bullet', '/resources/purple_ball.png');
}
var map;
var tileset;
var layer;
var player;
var facing = 'left';
var jumpTimer = 0;
var bg;
var cursors;
var spacebar;
var aKey;
var wKey;
var sKey;
var dKey;
var bullets;
var fireRate = 200;
var nextFire = 0;
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#000000';
    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedToCamera = true;
    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles-1');
    map.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);
    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();
    game.physics.arcade.gravity.y = 500;
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(50, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
    player = game.add.sprite(32, 32, 'dude');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.body.setSize(20, 32, 5, 16);
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    game.camera.follow(player);
    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
}
function update() {
    game.physics.arcade.collide(player, layer);
    game.physics.arcade.collide(bullets, layer, function (bullet, layer) {
        bullet.kill();
    });
    player.body.velocity.x = 0;
    if (cursors.left.isDown || aKey.isDown) {
        player.body.velocity.x = -150;
    }
    else if (cursors.right.isDown || dKey.isDown) {
        player.body.velocity.x = 150;
    }
    else {
        if (facing != 'idle') {
            player.animations.stop();
            if (facing == 'left') {
                player.frame = 0;
            }
            else {
                player.frame = 5;
            }
            facing = 'idle';
        }
    }
    if ((spacebar.isDown || cursors.up.isDown || wKey.isDown) && player.body.onFloor() && game.time.now > jumpTimer) {
        player.body.velocity.y = -300;
        jumpTimer = game.time.now + 750;
    }
    if (game.input.activePointer.isDown) {
        fire();
    }
}
function fire() {
    if (game.time.now > nextFire && bullets.countDead() > 0) {
        nextFire = game.time.now + fireRate;
        var bullet = bullets.getFirstDead();
        bullet.reset(player.x + 10, player.y + 20);
        game.physics.arcade.moveToPointer(bullet, 700);
    }
}
function render() {
    if (game.input.x < player.x - game.camera.x) {
        if (facing != 'left') {
            player.animations.play('left');
            facing = 'left';
        }
    }
    else {
        if (facing != 'right') {
            player.animations.play('right');
            facing = 'right';
        }
    }
}
