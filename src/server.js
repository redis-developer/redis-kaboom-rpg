const express = require('express');
const path = require('path');

const PORT = process.env.port||8080;

const app = express();

// Serve the front end statically from the 'public' folder.
app.use(express.static(path.join(__dirname, '../public')));

// Start the server.
app.listen(PORT, () => {
  console.log(`Redis Kaboom RPG server listening on port ${PORT}.`);
});