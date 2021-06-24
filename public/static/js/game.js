window.onload = function () {
  const k = kaboom({
    global: true,
    scale: 3,    
    clearColor: [0, 0, 0, 1],
    canvas: document.getElementById('game'),
    width: 180,
    height: 180
  });

  loadRoot('/');
  loadSprite('player', 'sprites/player.png');
  loadSprite('wall', 'sprites/wall.png');
  loadSprite('door', 'sprites/door.png');

  scene('play', (roomNumber) => { 
    const levelMap = [
      '=====|======',
      '=          =',
      '=          =',
      '=          =',
      '=          =',
      '|     @    |',
      '=          =',
      '=          =',
      '=          =',
      '=          =',
      '======|=====',
    ];

    addLevel(levelMap, {
      width: 12,
      height: 12,
      pos: vec2(20, 20),
      "@": [
        sprite('player'),
        'player'
      ],
      "=": [
        sprite('wall'),
        solid()
      ],
      "|": [
        sprite('door'),
        'door',
        solid()
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
			  player.move(directions[direction].scale(60));
		  });
	  }

    add([
      text(`todo: room ${roomNumber}!`, 6),
      pos(width() / 2, height() / 2),
      origin("center"),
    ]);

    player.overlaps('door', () => {
      alert('door');
    });

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