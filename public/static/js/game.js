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

  let keysHeld = [];
  let gameId;

  scene('play', async (roomNumber) => { 
    const res = await fetch(`/api/room/${gameId}/${roomNumber}`);
    const roomDetails = await res.json();

    let popupMsg = null;
    let keysHeldMsg = null;

    const showMsg = (msg) => {
      popupMsg = add([
        text(msg, 6),
        pos(width() / 2, 10),
        origin('center')
      ]);
    };

    const updateKeysHeld = () => {
      if (keysHeldMsg) {
        destroy(keysHeldMsg);
      }

      keysHeldMsg = add([
        text(`Keys held: ${keysHeld.length}`, 6),
        pos(55, 150),
        origin('center')
      ]);
    }

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
    updateKeysHeld();

    // Delete any key in this room if the player already collected it.
    const keys = get('key');
    if (keys.length > 0 && keysHeld.includes(roomNumber)) {
      destroy(keys[0]);
    }

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
          wait(0.5, () => {
            if (popupMsg) {
              destroy(popupMsg);
              popupMsg = null;
            }
          });
        }
		  });
		  keyDown(direction, () => {
			  player.move(directions[direction].scale(60));
		  });
	  }

    player.overlaps('door', (d) => {
      wait(0.3, ()=> {
        if (d.keysRequired && d.keysRequired > keysHeld.length) {
          showMsg(`You need ${d.keysRequired - keysHeld.length} more keys!`);
          camShake(10);
        } else {
          if (d.isEnd) {
            go('winner');
          } else {
            go('play', d.leadsTo);
          }
        }
      });
    });

    player.overlaps('key', (k) => {
      destroy(k);
      showMsg('You got a key!');
      keysHeld.push(roomNumber);
      updateKeysHeld();
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

  const newGame = async () => {
    const res = await fetch('/api/newgame');
    const newGameResponse = await res.json();

    gameId = newGameResponse.gameId;
    go('play', 0);
  }

  scene('start', () => {
    keysHeld = [];

    add([
      text('press space to begin!', 6),
      pos(width() / 2, height() / 2),
      origin('center'),
    ]);

    keyPress('space', () => {
      newGame();
    });
  });

  scene('winner', () => {
    keysHeld = [];

    // TODO GET THE GAME STATS. 

    add([
      text('you escaped, space restarts!', 6),
      pos(width() / 2, height() / 2),
      origin('center'),
    ]);

    keyPress('space', () => {
      newGame();
    });
  });

  start('start');
};