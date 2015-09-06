function update() {
    game.physics.arcade.collide(players, mainTileLayer);
    game.physics.arcade.collide(bullets, mainTileLayer, function (bullet, mainTileLayer) {
        bullet.kill();
    });
    if (!(players[sessionID] === undefined)) {
        players[sessionID].body.velocity.x = 0;
        game.physics.arcade.collide(players[sessionID], mainTileLayer);
        if (cursors.left.isDown || aKey.isDown) {
            players[sessionID].body.velocity.x = -150;
        }
        else if (cursors.right.isDown || dKey.isDown) {
            players[sessionID].body.velocity.x = 150;
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
        var rightStickX = pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X);
        var rightStickY = pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y);
        if (pad1.connected) {
            if (rightStickX || rightStickY) {
                fire();
            }
        }
        if (game.input.activePointer.isDown) {
            fire();
        }
        var vector = {
            playerID: sessionID,
            impulse: players[sessionID].body.velocity,
            position: players[sessionID].body.position
        };
        socket.emit('playerImpulse', vector);
    }
    socket.on('updatedImpulse', function (data) {
        players[data.playerID].body.velocity.y = data.impulse.y;
        players[data.playerID].body.velocity.x = data.impulse.x;
        players[data.playerID].body.position.y = data.position.y;
        players[data.playerID].body.position.x = data.position.x;
    });
    function fire() {
        if (game.time.now > nextFire && bullets.countDead() > 0 && (!(players[sessionID] === undefined))) {
            nextFire = game.time.now + fireRate;
            var bullet = bullets.getFirstDead();
            bullet.reset(players[sessionID].x + 10, players[sessionID].y + 20);
            if (pad1.connected) {
                var angleToShoot = Math.atan2(rightStickY, rightStickX);
                bullet.body.velocity.x = (Math.cos(angleToShoot) * 700);
                bullet.body.velocity.y = (Math.sin(angleToShoot) * 700);
            }
            else {
                game.physics.arcade.moveToPointer(bullet, 700);
            }
        }
    }
    if (game.input.activePointer.isDown) {
        fire();
    }
}
