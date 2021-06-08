window.onload = function () {
  const k = kaboom({
    width: 640,
    height: 480,
    canvas: document.getElementById('game')
  });

  k.scene('start', () => {
    k.add([
        k.text('well it\'s a start!', 32),
        k.pos(20, 200),
    ]);
  });

  k.start('start');
};