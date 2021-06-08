const express = require('express');
const path = require('path');
const Redis = require('ioredis');

const PORT = process.env.port||8080;

const app = express();
const redis = new Redis(); // TODO configurable location.

// Serve the front end statically from the 'public' folder.
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/room/:roomNumber', (req, res) => {
  res.json({ todo: true });
})

// Start the server.
app.listen(PORT, () => {
  console.log(`Redis Kaboom RPG server listening on port ${PORT}.`);
});