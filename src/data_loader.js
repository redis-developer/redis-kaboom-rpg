const Redis = require('ioredis');

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const loadGameData = async () => {
  // Connect to Redis...
  const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD
  });

  // Where we'll store the room data in Redis.
  const GAME_MAP_KEY = 'kaboom:rooms';

  // Load the room data from JSON file.
  const gameData = require('../game_map.json');

  // Delete any previous data in Redis and store the room data
  // as a JSON document.
  await redis.del(GAME_MAP_KEY);
  await redis.call('JSON.SET', GAME_MAP_KEY, '.', JSON.stringify(gameData));

  console.log('Data loaded!');

  redis.quit();
};

loadGameData();
