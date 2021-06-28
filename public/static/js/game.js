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
  loadSprite('key', 'sprites/key.png');
  loadSprite('flag', 'sprites/flag.png');
  loadSprite('door', 'sprites/door.png');
  loadSprite('lockeddoor', 'sprites/lockeddoor.png');

  let keysHeld;

  scene('play', async (roomNumber) => { 
    const res = await fetch(`/api/room/${roomNumber}`);
    const roomDetails = await res.json();

    let popupMsg = null;

    const showMsg = (msg) => {
      popupMsg = add([
        text(msg, 6),
        pos(width() / 2, 10),
        origin('center'),
      ]);
    };

    const roomConf = {
      width: roomDetails.layout[0].length,
      height: roomDetails.layout.length,
      pos: vec2(20, 20),
      '@': [
        sprite('player'),
        'player'
      ],
      '=': [
        sprite('wall'),
        solid()
      ],
      'k': [
        sprite('key'),
        'key',
        solid()
      ],
      'f': [
        sprite('flag'),
        'flag',
        solid()
      ]
    };

    for (const doorId in roomDetails.doors) {
      const door = roomDetails.doors[doorId];

      roomConf[doorId] = [
        sprite(door.keysRequired > 0 ? 'lockeddoor' : 'door'),
        'door',
        {
          leadsTo: door.leadsTo,
          keysRequired: door.keysRequired,
          isEnd: door.isEnd || false
        },
        solid()
      ];
    }

    addLevel(roomDetails.layout, roomConf);

    const player = get('player')[0];

    const directions = {
      'left': vec2(-1, 0),
      'right': vec2(1, 0),
      'up': vec2(0, -1),
      'down': vec2(0, 1)
    };

    for (const direction in directions) {
		  keyPress(direction, () => {
        if (popupMsg) {
          setTimeout(() => {
            destroy(popupMsg);
            popupMsg = null;
          }, 500);
        }
		  });
		  keyDown(direction, () => {
			  player.move(directions[direction].scale(60));
		  });
	  }

    player.overlaps('door', (d) => {
      setTimeout(() => {
        if (d.keysRequired && d.keysRequired > keysHeld) {
          showMsg(`You need ${d.keysRequired - keysHeld} more keys!`);
          camShake(10);
        } else {
          if (d.isEnd) {
            go('winner');
          } else {
            go('play', d.leadsTo);
          }
        }
      }, 300);
    });

    player.overlaps('key', (k) => {
      destroy(k);
      showMsg('You got a key!');
      keysHeld += 1;
    });

    player.overlaps('flag', () => {
      // Go to a random room number!
      let angle = 0.1;
      const timer = setInterval(async () => {
        camRot(angle);
        angle += 0.1;

        if (angle >= 6.0) {
          camRot(0);
          clearInterval(timer);
          
          const res = await fetch(`/api/randomroom`);
          const roomDetails = await res.json();
          go('play', roomDetails.room);
        }
      }, 10);
    });

    player.action(() => {
      player.resolve();
    });
  });

  scene('start', () => {
    keysHeld = 0;

    add([
      text('press space to begin!', 6),
      pos(width() / 2, height() / 2),
      origin('center'),
    ]);

    keyPress('space', () => {
      go('play', 0);
    });
  });

  scene('winner', () => {
    keysHeld = 0;

    add([
      text('you escaped, space restarts!', 6),
      pos(width() / 2, height() / 2),
      origin('center'),
    ]);

    keyPress('space', () => {
      go('play', 0);
    });
  });

  start('start');
};