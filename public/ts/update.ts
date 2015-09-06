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
        var vector = {
             playerID: sessionID,
             impulse: players[sessionID].body.velocity,
             position: players[sessionID].body.position
        }
        socket.emit('playerImpulse', vector);
    }

    //grab new players
    socket.on('updatedImpulse', function(data){
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
