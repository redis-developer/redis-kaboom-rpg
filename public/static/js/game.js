window.onload = function () {
  // Initialize Kaboom...
  const k = kaboom({
    global: true,
    scale: 3,    
    clearColor: [0, 0, 0, 1],
    canvas: document.getElementById('game'),
    width: 180,
    height: 180
  });

  // Load the various sprite graphics.
  loadRoot('/');
  loadSprite('player', 'sprites/player.png');
  loadSprite('wall', 'sprites/wall.png');
  loadSprite('key', 'sprites/key.png');
  loadSprite('flag', 'sprites/flag.png');
  loadSprite('door', 'sprites/door.png');
  loadSprite('lockeddoor', 'sprites/lockeddoor.png');

  // Globals to remember which rooms the player found 
  // keys in and the ID of the game they're playing.
  let keysHeld = [];
  let gameId;

  // Render a particular room...
  scene('play', async (roomNumber) => { 
    // Get the room details from the server.
    const res = await fetch(`/api/room/${gameId}/${roomNumber}`);
    const roomDetails = await res.json();

    let popupMsg = null;
    let keysHeldMsg = null;

    // Show a message e.g. one to tell the player how many
    // keys they need to open a locked door.
    const showMsg = (msg) => {
      popupMsg = add([
        text(msg, 6),
        pos(width() / 2, 10),
        origin('center')
      ]);
    };

    // Update the keys held message at the bottom of the screen.
    const updateKeysHeld = () => {
      if (keysHeldMsg) {
        destroy(keysHeldMsg);
      }

      keysHeldMsg = add([
        text(`Room ${roomNumber}. Keys held: ${keysHeld.length}`, 6),
        pos(80, 150),
        origin('center')
      ]);
    };

    // Mapping between characters in the room layout and sprites.
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

    // Mapping for each door, determines whether to show a locked
    // or unlocked door...
    for (const doorId in roomDetails.doors) {
      const door = roomDetails.doors[doorId];

      roomConf[doorId] = [
        sprite(door.keysRequired > 0 ? 'lockeddoor' : 'door'),
        'door',
        // Extra properties to store about this door - need
        // these when the player touches it to determine what
        // to do then.
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

    // Map key presses to player movement actions.
    for (const direction in directions) {
		  keyPress(direction, () => {
        // Destroy any popup message 1/2 a second after
        // the player starts to move again.
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
        // Move the player.
			  player.move(directions[direction].scale(60));
		  });
	  }

    // What to do when the player touches a door.
    player.overlaps('door', (d) => {
      wait(0.3, () => {
        // Does opening this door require more keys than the player holds?
        if (d.keysRequired && d.keysRequired > keysHeld.length) {
          showMsg(`You need ${d.keysRequired - keysHeld.length} more keys!`);
          camShake(10);
        } else {
          // Does this door lead to the end state, or another room?
          if (d.isEnd) {
            go('winner');
          } else {
            go('play', d.leadsTo);
          }
        }
      });
    });

    // What to do when the player touches a key.
    player.overlaps('key', (k) => {
      destroy(k);
      showMsg('You got a key!');
      // Remember the player has this key, so we don't
      // render it next time they enter this room and 
      // so we know they can unlock some doors now.
      keysHeld.push(roomNumber);
      updateKeysHeld();
    });

    // What to do when the player touches a flag.
    player.overlaps('flag', async () => {
      // Go to a random room number and spin the 
      // camera around and around.
      let angle = 0.1;
      const timer = setInterval(async () => {
        camRot(angle);
        angle += 0.1;

        if (angle >= 6.0) {
          // Stop spinning and go to the new room.
          camRot(0);
          clearInterval(timer);
          
          const res = await fetch('/api/randomroom');
          const roomDetails = await res.json();

          go('play', roomDetails.room);
        }
      }, 10);
    });

    // Update the player position etc - run every frame.
    player.action(() => {
      player.resolve();
    });
  });

  // Get a new game ID and start a new game.
  const newGame = async () => {
    const res = await fetch('/api/newgame');
    const newGameResponse = await res.json();

    gameId = newGameResponse.gameId;

    // New game always starts in room 0.
    go('play', 0);
  }

  // Display a message telling the player how to start
  // a new game.
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

  // This is the scene for when the player solves the
  // puzzle and escapes the maze with all the keys.
  scene('winner', async () => {
    // Reset for next game.
    keysHeld = [];

    // Get the number of times a room was entered and the 
    // overall elapsed time for this game.
    const res = await fetch(`/api/endgame/${gameId}`);
    const { roomEntries, elapsedTime } = await res.json();

    add([
      text(`you escaped in:\n\n${roomEntries} moves.\n\n${elapsedTime} seconds.\n\nspace restarts!`, 6),
      pos(width() / 2, height() / 2),
      origin('center'),
    ]);

    keyPress('space', () => {
      newGame();
    });
  });

  start('start');
};