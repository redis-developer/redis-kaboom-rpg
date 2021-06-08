window.onload = function () {
  const k = kaboom({
    global: true,
    width: 640,
    height: 480,
    clearColor: [0, 0, 0, 1],
    canvas: document.getElementById('game')
  });

  scene('play', (roomNumber) => { 
    add([
      text(`todo: room ${roomNumber}!`, 28),
      pos(width() / 2, height() / 2),
      origin("center"),
    ]);
  });

  scene('start', () => {
    add([
      text("press space to begin!", 28),
      pos(width() / 2, height() / 2),
      origin("center"),
    ]);

    keyPress('space', () => {
      go('play', 0);
    });
  });

  start('start');
};