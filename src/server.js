const express = require('express');
const path = require('path');
const Redis = require('ioredis');

const PORT = process.env.PORT||8080;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'; 
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const app = express();
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD 
});

const getRedisKeyName = n => `kaboom:${n}`;

const ROOM_KEY_NAME = getRedisKeyName('rooms');

// Serve the front end statically from the 'public' folder.
app.use(express.static(path.join(__dirname, '../public')));

// Start a new game.
app.get('/api/newgame', async (req, res) => {
  const gameId = Date.now();
  const gameKey = getRedisKeyName(gameId);

  // Start a new game and set a long expiry in case 
  // the user abandons it.
  await redis.xadd(gameKey, '*', 'event', 'start');
  redis.expire(gameKey, 86400);

  res.json({ gameId: gameId });
});

// Get details for a specified room number from Redis.
app.get('/api/room/:gameId/:roomNumber', async (req, res) => {
  const { gameId, roomNumber }  = req.params;

  // Store this movement in Redis.
  redis.xadd(getRedisKeyName(gameId), '*', 'roomEntry', roomNumber);

  // Get the room details for this room.
  const roomDetails = JSON.parse(await redis.call('JSON.GET', ROOM_KEY_NAME, `.[${roomNumber}]`));

  res.json(roomDetails);
});

// Get details for a specified room number.
app.get('/api/randomroom/', async (req, res) => {
  // Figure out how many rooms are available.
  const numRooms = await redis.call('JSON.ARRLEN', ROOM_KEY_NAME, '.');

  // Get a random number from room 0 to room (numRooms - 1).
  res.json({ room: Math.floor(Math.random() * (numRooms - 1)) });
});

// End the current game and get the stats.
app.get('/api/endgame/:gameId', async (req, res) => {
  const { gameId } = req.params;
  const keyName = getRedisKeyName(gameId);

  // How many times did they enter a room (length of stream minus 1 for
  // the start event).
  const roomEntries = await redis.xlen(keyName) - 1;

  // Get the first and last entries in the stream, and the overall
  // elapsed game time will be the difference between the timestamp
  // components of their IDs.
  const streamStartAndEnd = await Promise.all([
    redis.xrange(keyName, '-', '+', 'COUNT', 1),
    redis.xrevrange(keyName, '+', '-', 'COUNT', 1),
  ]);

  // Parse out the timestamps from the Redis return values.
  const startTimeStamp = parseInt(streamStartAndEnd[0][0][0].split('-')[0], 10);
  const endTimeStamp = parseInt(streamStartAndEnd[1][0][0].split('-')[0], 10);
  const elapsedTime = Math.floor((endTimeStamp - startTimeStamp) / 1000);

  // Tidy up, delete the stream we don't need it any more.
  redis.del(getRedisKeyName(gameId));

  res.json({ roomEntries, elapsedTime });
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Redis Kaboom RPG server listening on port ${PORT}, Redis at ${REDIS_HOST}:${REDIS_PORT}.`);
});