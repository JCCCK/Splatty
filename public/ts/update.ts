function update(){
    //check for collisions
    game.physics.arcade.collide(players, mainTileLayer);
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
             sessionID: sessionID,
             impulse: players[sessionID].body.velocity
        }
        socket.emit('playerImpulse', vector);
    }

    //grab new players
    socket.on('updatedImpulse', function(data){
        var i = data.sessionID;
    });

    function fire() {
        if (game.time.now > nextFire && bullets.countDead() > 0 && (!(players[sessionID] === undefined))) {
            nextFire = game.time.now + fireRate;
            var bullet = bullets.getFirstDead();
            bullet.reset(players[sessionID].x + 10, players[sessionID].y + 20);
            game.physics.arcade.moveToPointer(bullet, 700);
        }

    }

    if (game.input.activePointer.isDown) {
        fire();
    }
}
