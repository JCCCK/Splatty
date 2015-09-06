function render() {
    if (game.input.gamepad.pad1.connected) {
        var rightStickX1 = pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X);
        var rightStickY1 = pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y);
        var leftStickX1 = pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X);
        var leftStickY1 = pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y);
        if (!(Math.pow(rightStickX1, 2) || (Math.pow(rightStickY1, 2)) > 0.01)) {
            if (leftStickX1 > 0.1) {
                if (facing != 'right') {
                    players[sessionID].animations.play('right');
                    facing = 'right';
                }
            }
            else if (leftStickX1 < -0.1) {
                if (facing != 'left') {
                    players[sessionID].animations.play('left');
                    facing = 'left';
                }
            }
        }
        else {
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
    }
    else {
        if (players[sessionID] === undefined) {
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
