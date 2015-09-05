var mainState = {
    preload: function () {
    },
    create: function () {
        game.stage.backgroundColor = '#3498db';
    },
    update: function () {
    },
};
var game = new Phaser.Game(720, 480, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');
game.physics.startSystem(Phaser.Physics.ARCADE);



GarageServerIO.initializeGarageServer('insertmygameserverurlhere.com', { /* options */ });

// Inside game loop...
GarageServerIO.addInput(/*player input - in this example 'left' or 'right'*/);

var playerStates = GarageServerIO.getPlayerStates();
playerStates.forEach(function (player) {
    ctxCanvas.fillRect(player.state.x, 0, 5, 5);
});
