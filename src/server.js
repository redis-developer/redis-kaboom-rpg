const express = require('express');
const path = require('path');
const Redis = require('ioredis');

// Redis configuration.
const PORT = process.env.PORT||8080;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'; 
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const app = express();

// Connect to Redis.
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD 
});

// Keep our Redis keys in a namespace.
const getRedisKeyName = n => `kaboom:${n}`;

// We'll use this key a lot to get data about rooms, stored
// in Redis as a JSON document.
const ROOM_KEY_NAME = getRedisKeyName('rooms');

// Serve the front end statically from the 'public' folder.
app.use(express.static(path.join(__dirname, '../public')));

// Start a new game.
app.get('/api/newgame', async (req, res) => {
  const gameId = Date.now();
  const gameMovesKey = getRedisKeyName(`moves:${gameId}`);

  // Start a new stream for this game and set a long expiry in case 
  // the user abandons it.
  await redis.xadd(gameMovesKey, '*', 'event', 'start');
  redis.expire(gameMovesKey, 86400);

  // Pick 3 random room numbers to place the keys in for this game.
  let keysPlaced = 0;

  // We'll store these in a Redis set, so we'll need a key for that...
  const keyLocationsKey = getRedisKeyName(`keylocations:${gameId}`);

  // Figure out how many rooms are available so we know what the range
  // of room numbers to pick from is.
  const numRooms = await redis.call('JSON.ARRLEN', ROOM_KEY_NAME, '.');

  do {
    const roomNumber = Math.floor(Math.random() * (numRooms - 1));
    await redis.sadd(keyLocationsKey, roomNumber);
    keysPlaced = await redis.scard(keyLocationsKey);
  } while (keysPlaced < 3);

  // Set a long expiry on the key locations key in case the user
  // abandons the game.
  redis.expire(keyLocationsKey, 86400);

  console.log(`Started game ${gameId}.`);

  res.json({ gameId: gameId });
});

// Get JSON array of all currently active game IDs.
app.get('/api/activegames', async (req, res) => {

  // Scan through all keys in the stream starting with "kaboom:moves".
  const stream = redis.scanStream({
    match: 'kaboom:moves:*'
  });

  const gameIds = [];

  stream.on('data', (keys) => {
    // Extract the gameId from the key and append to gameIds array.
    keys.forEach((key) => gameIds.push(key.split(':')[2]));
  });

  stream.on('end', () => {
    res.status(200).json({
      data: {
        gameIds,
        length: gameIds.length
      },
      status: 'success',
    })
  })
});

// Get details for a specified room number from Redis.
app.get('/api/room/:gameId/:roomNumber', async (req, res) => {
  const { gameId, roomNumber } = req.params;

  const minRoomNumber = 0;
  const roomCount = JSON.parse(await redis.call('JSON.ARRLEN', ROOM_KEY_NAME, '.'));
  const maxRoomNumber = roomCount - 1;
  const roomNumberInteger = parseInt(roomNumber);

  if (roomNumberInteger < minRoomNumber || roomNumberInteger > maxRoomNumber) {
    console.log(`/api/room/:gameId/:roomNumber called with invalid room number of ${roomNumber}`)
    return res.status(400).send('Invalid room number')
  }

  // Store this movement in Redis.
  redis.xadd(getRedisKeyName(`moves:${gameId}`), '*', 'roomEntry', roomNumber);

  // Get the room details for this room.
  const roomDetails = JSON.parse(await redis.call('JSON.GET', ROOM_KEY_NAME, `[${roomNumber}]`));

  // Does this room have a key in it for this specific game?
  const roomHasKey = await redis.sismember(getRedisKeyName(`keylocations:${gameId}`), roomNumber);
  
  if (roomHasKey === 0) {
    // No key here, so remove the 'k' placeholder from the room map.
    // String.replaceAll not available until Node 15...
    roomDetails.layout = roomDetails.layout.map(row => row.split('k').join(' '));
  }

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

  // Check the format of the gameId in the request
  if (isNaN(gameId) || !/^[1-9]+[0-9]*$/.test(gameId)) {
    console.log(`/api/endgame/:gameId called with invalid gameId: ${gameId}.`);
    return res.status(400).send('Invalid gameId specified, should be a whole number greater than zero');
  }

  // Check for gameIds that could only exist in the future
  if (gameId > Date.now()) {
    console.log(`/api/endgame/:gameId called with future gameId: ${gameId}.`);
    return res.status(400).send('Time travelling not allowed, this game hasn\'t started yet!');
  }

  const gameMovesKey = getRedisKeyName(`moves:${gameId}`);

  // Does this gameMovesKey (still) exist?
  const gameMovesKeyExists = await redis.exists(gameMovesKey);
  if (!gameMovesKeyExists) {
    console.log(`Request for invalid or completed gameId: ${gameId}.`);
    return res.status(400).send('Game not found, invalid gameId or game has ended');
  }

  // How many times did they enter a room (length of stream minus 1 for
  // the start event).
  const roomEntries = await redis.xlen(gameMovesKey) - 1;

  // Get the first and last entries in the stream, and the overall
  // elapsed game time will be the difference between the timestamp
  // components of their IDs.
  const streamStartAndEnd = await Promise.all([
    redis.xrange(gameMovesKey, '-', '+', 'COUNT', 1),
    redis.xrevrange(gameMovesKey, '+', '-', 'COUNT', 1),
  ]);

  // Parse out the timestamps from the Redis return values.
  const startTimeStamp = parseInt(streamStartAndEnd[0][0][0].split('-')[0], 10);
  const endTimeStamp = parseInt(streamStartAndEnd[1][0][0].split('-')[0], 10);
  const elapsedTime = Math.floor((endTimeStamp - startTimeStamp) / 1000);

  // Tidy up, delete the stream and key locations keys as 
  // we don't need them any more.
  redis.del(gameMovesKey);
  redis.del(getRedisKeyName(`keylocations:${gameId}`));

  console.log(`Game ${gameId} has ended.`);

  res.json({ roomEntries, elapsedTime });
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Redis Kaboom RPG server listening on port ${PORT}, Redis at ${REDIS_HOST}:${REDIS_PORT}.`);
});
