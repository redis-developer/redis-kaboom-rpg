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

// Serve the front end statically from the 'public' folder.
app.use(express.static(path.join(__dirname, '../public')));

// Get details for a specified room number from Redis.
app.get('/api/room/:roomNumber', (req, res) => {
  const roomDetails = {
    layout: [ 
      '=====1======',
      '=          =',
      '=          =',
      '=          =',
      '=          =',
      '2     @    3',
      '=          =',
      '=          =',
      '=          =',
      '=          =',
      '======4====='
    ],
    width: 12,
    height: 12,
    doors: {
      '1': {
        leadsTo: 99,
        keysRequired: 0
      },
      '2': {
        leadsTo: 99,
        keysRequired: 0
      },
      '3': {
        leadsTo: 99,
        isEnd: true,
        keysRequired: 1
      },
      '4': {
        leadsTo: 99,
        keysRequired: 0
      }
    }
  };

  const otherRoomDetails = {
    layout: [ 
      '============',
      '=     =    =',
      '=  =f =    2',
      '=  ====    =',
      '=          =',
      '=     @    =',
      '=          =',
      '=     ==== =',
      '1     =    =',
      '=     =k   =',
      '============'
    ],
    width: 12,
    height: 12,
    doors: {
      '1': {
        leadsTo: 0,
        keysRequired: 0
      },
      '2': {
        leadsTo: 0,
        keysRequired: 0
      }
    }
  };

  res.json(req.params.roomNumber === '0' ? roomDetails : otherRoomDetails);
})

// Start the server.
app.listen(PORT, () => {
  console.log(`Redis Kaboom RPG server listening on port ${PORT}, Redis at ${REDIS_HOST}:${REDIS_PORT}.`);
});