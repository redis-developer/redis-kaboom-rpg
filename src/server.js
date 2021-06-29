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
app.get('/api/room/:gameId/:roomNumber', (req, res) => {
  const { gameId, roomNumber }  = req.params;

  const roomDetails = [
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    2',
        '=          =',
        '=          =',
        '=  f       =',
        '=          =',
        '======3====='
      ],
      doors: {
        '1': {
          leadsTo: 1
        },
        '2': {
          leadsTo: 0,
          isEnd: true,
          keysRequired: 3
        },
        '3': {
          leadsTo: 3
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '= ===      =',
        '1   = @    =',
        '=   =      =',
        '=          =',
        '=          =',
        '=          =',
        '======2====='
      ],
      doors: {
        '1': {
          leadsTo: 2
        },
        '2': {
          leadsTo: 0
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=   =      =',
        '=          =',
        '=      =====',
        '1     @=   2',
        '=      = ===',
        '=          =',
        '=   =      =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 3
        },
        '2': {
          leadsTo: 1
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '2     @    3',
        '=          =',
        '=          =',
        '=  =====   =',
        '=      =   =',
        '======4====='
      ],
      doors: {
        '1': {
          leadsTo: 6
        },
        '2': {
          leadsTo: 4
        },
        '3': {
          leadsTo: 2
        },
        '4': {
          leadsTo: 28,
          keysRequired: 1
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=    ==    =',
        '1  f  @=   2',
        '=     ==   =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 5
        },
        '2': {
          leadsTo: 3
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    1',
        '=          =',
        '=          =',
        '========   =',
        '=  k       =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 4
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=     =    =',
        '=          =',
        '=          =',
        '=     @    =',
        '=  ==      =',
        '=          =',
        '=  =    =  =',
        '=          =',
        '======2====='
      ],
      doors: {
        '1': {
          leadsTo: 7
        },
        '2': {
          leadsTo: 3
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '2     @    =',
        '=          =',
        '=          =',
        '=   ====   =',
        '=          =',
        '======3====='
      ],
      doors: {
        '1': {
          leadsTo: 8
        },
        '2': {
          leadsTo: 14
        },
        '3': {
          leadsTo: 6
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=   =      =',
        '=          =',
        '=       =  =',
        '=     @    =',
        '=          =',
        '=  =       =',
        '=      =   =',
        '=          =',
        '======2====='
      ],
      doors: {
        '1': {
          leadsTo: 9
        },
        '2': {
          leadsTo: 7
        }
      }
    },
    {
      layout: [ 
        '============',
        '=   k =    =',
        '=   = =    =',
        '=          =',
        '=          =',
        '1     @    =',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '======2====='
      ],
      doors: {
        '1': {
          leadsTo: 10
        },
        '2': {
          leadsTo: 8
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '1     @    2',
        '=          =',
        '=          =',
        '=    ===   =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 11
        },
        '2': {
          leadsTo: 9
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    1',
        '=          =',
        '=    = =   =',
        '=    = =   =',
        '=    = =   =',
        '======2====='
      ],
      doors: {
        '1': {
          leadsTo: 10
        },
        '2': {
          leadsTo: 12
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    =',
        '=          =',
        '=          =',
        '=    =======',
        '=          =',
        '======2====='
      ],
      doors: {
        '1': {
          leadsTo: 11
        },
        '2': {
          leadsTo: 13
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=    ===   =',
        '=          =',
        '2     @    3',
        '=          =',
        '=          =',
        '=    f     =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 12
        },
        '2': {
          leadsTo: 15
        },
        '3': {
          leadsTo: 14
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=   ====   =',
        '=          =',
        '=          =',
        '1  =  @ =  2',
        '=          =',
        '=          =',
        '=    ==    =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 13
        },
        '2': {
          leadsTo: 7
        }
      }
    },
    {
      layout: [ 
        '============',
        '=    =     =',
        '=    =     =',
        '=    =     =',
        '=    =     =',
        '1     @    2',
        '=          =',
        '=      =   =',
        '=      =   =',
        '=      =   =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 16
        },
        '2': {
          leadsTo: 13
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '1  =   @   2',
        '=  =       =',
        '=  =       =',
        '=  =       =',
        '=          =',
        '=====3======'
      ],
      doors: {
        '1': {
          leadsTo: 17
        },
        '2': {
          leadsTo: 15
        },
        '3': {
          leadsTo: 20
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=   = = =  =',
        '1   = @ =  2',
        '=   =   =  =',
        '=   =   =  =',
        '=          =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 18
        },
        '2': {
          leadsTo: 16
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @=   1',
        '=          =',
        '=          =',
        '=    ===   =',
        '=          =',
        '=====2======'
      ],
      doors: {
        '1': {
          leadsTo: 17
        },
        '2': {
          leadsTo: 19,
          keysRequired: 1
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=       =  =',
        '=   =      =',
        '=   f      =',
        '=          =',
        '=     @    =',
        '=          =',
        '= ====== = =',
        '=  k       =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 18
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=   ====   =',
        '=          =',
        '=          =',
        '=     @    =',
        '=          =',
        '=          =',
        '=   ====   =',
        '=          =',
        '=====2======'
      ],
      doors: {
        '1': {
          leadsTo: 16
        },
        '2': {
          leadsTo: 21
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=   ====   =',
        '=          =',
        '=          =',
        '=     @    =',
        '=          =',
        '=          =',
        '=   ====   =',
        '=          =',
        '======2====='
      ],
      doors: {
        '1': {
          leadsTo: 20
        },
        '2': {
          leadsTo: 22
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=    =@=   =',
        '=     =    =',
        '=          =',
        '=          =',
        '=          =',
        '======2====='
      ],
      doors: {
        '1': {
          leadsTo: 21
        },
        '2': {
          leadsTo: 23
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '==         =',
        '=          =',
        '=     @    2',
        '=          =',
        '=          =',
        '=     =    =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 22
        },
        '2': {
          leadsTo: 24
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=  f       =',
        '=   fffff  =',
        '1     @ f  2',
        '=   f fff  =',
        '=   f      =',
        '=   f      =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 23
        },
        '2': {
          leadsTo: 25
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=  =       =',
        '=  =       =',
        '=  =       =',
        '1  =  @    2',
        '=  =       =',
        '=  =       =',
        '=  =       =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 24
        },
        '2': {
          leadsTo: 26
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=     ==   =',
        '=     f    =',
        '=     =    =',
        '1     @    2',
        '=          =',
        '=          =',
        '=   =      =',
        '=   ====   =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 25
        },
        '2': {
          leadsTo: 27
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=   =      =',
        '2   =  @   3',
        '= = =      =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 28,
          keysRequired: 2
        },
        '2': {
          leadsTo: 26
        },
        '3': {
          leadsTo: 29
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=      =   =',
        '=   =      =',
        '=   k      =',
        '=   =      =',
        '=     @    =',
        '=        = =',
        '=          =',
        '=     =    =',
        '=          =',
        '======2====='
      ],
      doors: {
        '1': {
          leadsTo: 3,
          keysRequired: 1
        },
        '2': {
          leadsTo: 27,
          keysRequired: 2
        }
      }
    },
    {
      layout: [ 
        '============',
        '=          =',
        '=   =      =',
        '=        = =',
        '=          =',
        '1     @    2',
        '=          =',
        '=  =       =',
        '=       =  =',
        '=  f       =',
        '=====3======'
      ],
      doors: {
        '1': {
          leadsTo: 27
        },
        '2': {
          leadsTo: 31
        },
        '3': {
          leadsTo: 30
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '= ==========',
        '=          =',
        '=     @    =',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 29
        }
      }
    },
    {
      layout: [ 
        '=====1======',
        '= =   =    =',
        '=   =   =  =',
        '=      ==  =',
        '=          =',
        '2   = @    =',
        '=          =',
        '=  =       =',
        '=       =  =',
        '=     =    =',
        '============'
      ],
      doors: {
        '1': {
          leadsTo: 0
        },
        '2': {
          leadsTo: 29
        }
      }
    },
  ];

  // Store this movement in Redis.
  redis.xadd(getRedisKeyName(gameId), '*', 'roomEntry', roomNumber);

  res.json(roomDetails[roomNumber]);
});

// Get details for a specified room number.
app.get('/api/randomroom/', (req, res) => {
  // TODO get a random room from the ones available... 0-31 right now,
  // do this properly from the database later...
  res.json({ room: Math.floor(Math.random() * 31) });
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