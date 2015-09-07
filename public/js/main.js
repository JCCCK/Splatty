var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'gameDiv', { preload: preload, create: create, update: update, render: render });
var socket = io.connect('https://splatty.co');
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
    this.stage.disableVisibilityChange = true;
    game.load.image('background', '/resources/background.png');
    game.load.tilemap('level1', '/resources/level/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-default', '/resources/level/tiles-default.png');
    game.load.image('tiles-dark-blue', '/resources/level/tiles-dark-blue.png');
    game.load.image('tiles-green', '/resources/level/tiles-green.png');
    game.load.image('tiles-light-blue', '/resources/level/tiles-light-blue.png');
    game.load.image('tiles-purple', '/resources/level/tiles-purple.png');
    game.load.spritesheet('dude0', '/resources/dudes/dark_blue_dude.png', 32, 48);
    game.load.spritesheet('dude1', '/resources/dudes/green_dude.png', 32, 48);
    game.load.spritesheet('dude2', '/resources/dudes/light_blue_dude.png', 32, 48);
    game.load.spritesheet('dude3', '/resources/dudes/purple_dude.png', 32, 48);
    game.load.image('bullet0', '/resources/bullets/dark_blue_bullet.png');
    game.load.image('bullet1', '/resources/bullets/green_bullet.png');
    game.load.image('bullet2', '/resources/bullets/light_blue_bullet.png');
    game.load.image('bullet3', '/resources/bullets/purple_bullet.png');
    game.load.image('controllerconnected', '/resources/gun.png');
    game.load.audio('jump_up', '/resources/sounds/jump_up.wav');
    game.load.audio('jump_land', '/resources/sounds/jump_land.wav');
    game.load.audio('splash', '/resources/sounds/splash.wav');
}
