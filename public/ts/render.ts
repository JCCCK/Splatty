function render () {
    if (game.input.gamepad.pad1.connected) {
        var rightStickX1 = pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X);
        var rightStickY1 = pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y);
        if (rightStickX1 > 0.1) {
            if (facing != 'right') {
                players[sessionID].animations.play('right');
                facing = 'right';
            }
        }
        else if (rightStickX1 < -0.1) {
            if (facing != 'left') {
                players[sessionID].animations.play('left');
                facing = 'left';
            }
        }
    }
    else {
        if  (players[sessionID] === undefined){

        }
        else {
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
    }
}
