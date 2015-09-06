function update() {
    game.physics.arcade.collide(players, mainTileLayer);
    game.physics.arcade.collide(bullets, mainTileLayer, function (bullet, mainTileLayer) {
        bullet.kill();
        map.putTile(401, mainTileLayer.x, mainTileLayer.y, splatterTileLayer);
    });
    if (!(players[sessionID] === undefined)) {
        players[sessionID].body.velocity.x = 0;
        game.physics.arcade.collide(players[sessionID], mainTileLayer);
        if (cursors.left.isDown || aKey.isDown || (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1)) {
            players[sessionID].body.velocity.x = -150;
        }
        else if (cursors.right.isDown || dKey.isDown || (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1)) {
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
        if ((spacebar.isDown || cursors.up.isDown || wKey.isDown || (pad1.justPressed(Phaser.Gamepad.XBOX360_A))) && players[sessionID].body.onFloor() && game.time.now > jumpTimer) {
            players[sessionID].body.velocity.y = -300;
            jumpTimer = game.time.now + 750;
        }
        if (pad1.connected) {
            var rightStickX1 = pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X);
            var rightStickY1 = pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y);
              if (rightStickX1 || rightStickY1) {
                fire();
              }
        }
        if (pad2.connected) {
            var rightStickX2 = pad2.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X);
            var rightStickY2 = pad2.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y);
              if (rightStickX2 || rightStickY2) {
                fire();
              }
        }
        if (pad3.connected) {
            var rightStickX3 = pad3.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X);
            var rightStickY3 = pad3.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y);
              if (rightStickX3 || rightStickY3) {
                fire();
              }
        }
        if (pad4.connected) {
            var rightStickX4 = pad4.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X);
            var rightStickY4 = pad4.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y);
              if (rightStickX4 || rightStickY4) {
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
    socket.on('firedProjectile', function(data){
        if(data.playerID != sessionID){
            var bullet = bullets.getFirstDead();
            bullet.reset(players[data.playerID].x + 10, players[data.playerID].y + 20);
            game.physics.arcade.moveToXY(bullet, data.x, data.y, 700);
        }
    });
    function fire() {
        if (game.time.now > nextFire && bullets.countDead() > 0 && (!(players[sessionID] === undefined))) {
            nextFire = game.time.now + fireRate;
            var bullet = bullets.getFirstDead();
            var bulletTarget = {};
            bullet.reset(players[sessionID].x + 10, players[sessionID].y + 20);
            if (pad1.connected) {
                var angleToShoot = Math.atan2(rightStickY1, rightStickX1);
                bullet.body.velocity.x = (Math.cos(angleToShoot) * 700);
                bullet.body.velocity.y = (Math.sin(angleToShoot) * 700);
            }
            if (pad2.connected) {
                var angleToShoot = Math.atan2(rightStickY2, rightStickX2);
                bullet.body.velocity.x = (Math.cos(angleToShoot) * 700);
                bullet.body.velocity.y = (Math.sin(angleToShoot) * 700);
            }
            if (pad3.connected) {
                var angleToShoot = Math.atan2(rightStickY3, rightStickX3);
                bullet.body.velocity.x = (Math.cos(angleToShoot) * 700);
                bullet.body.velocity.y = (Math.sin(angleToShoot) * 700);
            }
            if (pad4.connected) {
                var angleToShoot = Math.atan2(rightStickY4, rightStickX4);
                bullet.body.velocity.x = (Math.cos(angleToShoot) * 700);
                bullet.body.velocity.y = (Math.sin(angleToShoot) * 700);
            }
            else {
                game.physics.arcade.moveToPointer(bullet, 700);
            }
            game.physics.arcade.moveToPointer(bullet, 700);
            bulletTarget = {
                x: game.input.mousePointer.x,
                y: game.input.mousePointer.y,
                playerID: sessionID
            }
            socket.emit('bulletImpulse', bulletTarget);
        }
    }
    if (game.input.activePointer.isDown) {
        fire();
    }
}
