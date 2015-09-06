function render (){
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
