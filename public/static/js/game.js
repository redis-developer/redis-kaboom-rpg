window.onload = function () {
  const k = kaboom({
    global: true,
    scale: 4,    
    clearColor: [0, 0, 0, 1],
    canvas: document.getElementById('game'),
    width: 150,
    height: 150
  });

  loadRoot('/');
  loadSprite('player', 'sprites/player.png');

  scene('play', (roomNumber) => { 
    const levelMap = [
      '           ',
      '           ',
      '           ',
      '           ',
      '           ',
      '           ',
      '           ',
      '           ',
      '           ',
      '           ',
      '     @     ',
    ];

    addLevel(levelMap, {
      width: 11,
      height: 11,
      pos: vec2(20, 20),
      "@": [
        sprite('player'),
        'player'
      ]
    });

    const player = get('player')[0];

    const directions = {
      'left': vec2(-1, 0),
      'right': vec2(1, 0),
      'up': vec2(0, -1),
      'down': vec2(0, 1)
    };

    for (const direction in directions) {
		  keyPress(direction, () => {
		  });
		  keyDown(direction, () => {
        console.log(direction);
			  //player.move(dirs[dir].scale(60));
		  });
	  }

    add([
      text(`todo: room ${roomNumber}!`, 6),
      pos(width() / 2, height() / 2),
      origin("center"),
    ]);

    player.action(() => {
      player.resolve();
    });
  });

  scene('start', () => {
    add([
      text("press space to begin!", 6),
      pos(width() / 2, height() / 2),
      origin("center"),
    ]);

    keyPress('space', () => {
      go('play', 0);
    });
  });

  start('start');
};