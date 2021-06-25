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
    '0': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 1,
          keysRequired: 0
        },
        '2': {
          leadsTo: 0,
          isEnd: true,
          keysRequired: 3
        },
        '3': {
          leadsTo: 3,
          keysRequired: 0
        }
      }
    },
    '1': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 2,
          keysRequired: 0
        },
        '2': {
          leadsTo: 0,
          keysRequired: 0
        }
      }
    },
    '2': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 3,
          keysRequired: 0
        },
        '2': {
          leadsTo: 1,
          keysRequired: 0
        }
      }
    },
    '3': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 6,
          keysRequired: 0
        },
        '2': {
          leadsTo: 4,
          keysRequired: 0
        },
        '3': {
          leadsTo: 2,
          keysRequired: 0
        },
        '4': {
          leadsTo: 28,
          keysRequired: 1
        }
      }
    },
    '4': {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '1  f  @    2',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 5,
          keysRequired: 0
        },
        '2': {
          leadsTo: 3,
          keysRequired: 0
        }
      }
    },
    '5': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 4,
          keysRequired: 0
        }
      }
    },
    '6': {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    =',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '======2====='
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 7,
          keysRequired: 0
        },
        '2': {
          leadsTo: 3,
          keysRequired: 0
        }
      }
    },
    '7': {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '2     @    =',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '======3====='
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 8,
          keysRequired: 0
        },
        '2': {
          leadsTo: 14,
          keysRequired: 0
        },
        '3': {
          leadsTo: 6,
          keysRequired: 0
        }
      }
    },
    '8': {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    =',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '======2====='
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 9,
          keysRequired: 0
        },
        '2': {
          leadsTo: 7,
          keysRequired: 0
        }
      }
    },
    '9': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 10,
          keysRequired: 0
        },
        '2': {
          leadsTo: 8,
          keysRequired: 0
        }
      }
    },
    '10': {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '1     @    2',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 11,
          keysRequired: 0
        },
        '2': {
          leadsTo: 9,
          keysRequired: 0
        }
      }
    },
    '11': {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    1',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '======2====='
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 10,
          keysRequired: 0
        },
        '2': {
          leadsTo: 12,
          keysRequired: 0
        }
      }
    },
    '12': {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    =',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '======2====='
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 11,
          keysRequired: 0
        },
        '2': {
          leadsTo: 13,
          keysRequired: 0
        }
      }
    },
    '13': {
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
        '============'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 12,
          keysRequired: 0
        },
        '2': {
          leadsTo: 15,
          keysRequired: 0
        },
        '3': {
          leadsTo: 14,
          keysRequired: 0
        }
      }
    },
    '14': {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '1     @    2',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 13,
          keysRequired: 0
        },
        '2': {
          leadsTo: 7,
          keysRequired: 0
        }
      }
    },
    '15': {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '1     @    2',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 16,
          keysRequired: 0
        },
        '2': {
          leadsTo: 13,
          keysRequired: 0
        }
      }
    },
    '16': {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '1     @    2',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=====3======'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 17,
          keysRequired: 0
        },
        '2': {
          leadsTo: 15,
          keysRequired: 0
        },
        '3': {
          leadsTo: 20,
          keysRequired: 0
        }
      }
    },
    '17': {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '1     @    2',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 18,
          keysRequired: 0
        },
        '2': {
          leadsTo: 16,
          keysRequired: 0
        }
      }
    },
    '18': {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    1',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=====2======'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 17,
          keysRequired: 0
        },
        '2': {
          leadsTo: 19,
          keysRequired: 1
        }
      }
    },
    '19': {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=   f      =',
        '=          =',
        '=     @    =',
        '=          =',
        '= ====== = =',
        '=  k       =',
        '=          =',
        '============'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 18,
          keysRequired: 0
        }
      }
    },
    '20': {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    =',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=====2======'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 16,
          keysRequired: 0
        },
        '2': {
          leadsTo: 21,
          keysRequired: 0
        }
      }
    },
    '21': {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    =',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '======2====='
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 20,
          keysRequired: 0
        },
        '2': {
          leadsTo: 22,
          keysRequired: 0
        }
      }
    },
    '22': {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    =',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '======2====='
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 21,
          keysRequired: 0
        },
        '2': {
          leadsTo: 23,
          keysRequired: 0
        }
      }
    },
    '23': {
      layout: [ 
        '=====1======',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '=     @    2',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 22,
          keysRequired: 0
        },
        '2': {
          leadsTo: 24,
          keysRequired: 0
        }
      }
    },
    '24': {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '1     @    2',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 23,
          keysRequired: 0
        },
        '2': {
          leadsTo: 25,
          keysRequired: 0
        }
      }
    },
    '25': {
      layout: [ 
        '============',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '1     @    2',
        '=          =',
        '=          =',
        '=          =',
        '=          =',
        '============'
      ],
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 24,
          keysRequired: 0
        },
        '2': {
          leadsTo: 26,
          keysRequired: 0
        }
      }
    },
    '26': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 25,
          keysRequired: 0
        },
        '2': {
          leadsTo: 27,
          keysRequired: 0
        }
      }
    },
    '27': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 28,
          keysRequired: 2
        },
        '2': {
          leadsTo: 26,
          keysRequired: 0
        },
        '3': {
          leadsTo: 29,
          keysRequired: 0
        }
      }
    },
    '28': {
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
      width: 12,
      height: 12,
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
    '29': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 27,
          keysRequired: 0
        },
        '2': {
          leadsTo: 31,
          keysRequired: 0
        },
        '3': {
          leadsTo: 30,
          keysRequired: 0
        }
      }
    },
    '30': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 29,
          keysRequired: 0
        }
      }
    },
    '31': {
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
      width: 12,
      height: 12,
      doors: {
        '1': {
          leadsTo: 0,
          keysRequired: 0
        },
        '2': {
          leadsTo: 29,
          keysRequired: 0
        }
      }
    },
  };

  res.json(roomDetails[req.params.roomNumber]);
});

// Get details for a specified room number.
app.get('/api/randomroom/', (req, res) => {
  // TODO get a random room from the ones available... 0-31 right now,
  // do this properly from the database later...
  res.json({ room: Math.floor(Math.random() * 31) });
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Redis Kaboom RPG server listening on port ${PORT}, Redis at ${REDIS_HOST}:${REDIS_PORT}.`);
});