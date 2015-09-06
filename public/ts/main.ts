//init game
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'gameDiv', { preload: preload, create: create, update: update, render: render });

//session stuff
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

//preload
function preload() {
    //preload background
    game.load.image('background', '/resources/background.png');

    //preload tilemap
    game.load.tilemap('level1', '/resources/level/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', '/resources/level/tiles-default.png');


    //preload character
    game.load.spritesheet('dude0', '/resources/dudes/dark_blue_dude.png', 32, 48);
    game.load.spritesheet('dude1', '/resources/dudes/green_dude.png', 32, 48);
    game.load.spritesheet('dude2', '/resources/dudes/light_blue_dude.png', 32, 48);
    game.load.spritesheet('dude3', '/resources/dudes/purple_dude.png', 32, 48);

    //preload bullets
    game.load.image('bullet0', '/resources/bullets/dark_blue_bullet.png');
    game.load.image('bullet1', '/resources/bullets/green_bullet.png');
    game.load.image('bullet2', '/resources/bullets/light_blue_bullet.png');
    game.load.image('bullet3', '/resources/bullets/purple_bullet.png');

}
