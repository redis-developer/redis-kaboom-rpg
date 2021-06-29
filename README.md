# Redis Kaboom RPG Type Game

This is an RPG maze type game built with [Kaboom.js](https://kaboomjs.com/), Node.js and [Redis](https://redis.io).

## Clone Repo and Install Dependencies

```bash
$ git clone https://github.com/simonprickett/redis-kaboom-rpg.git
$ cd redis-kaboom-rpg
$ npm install
```

## Redis Setup

This game uses Redis as a data store.  The code assumes that Redis is running on localhost port 6379 unless you provide an alternative Redis host and port by setting the `REDIS_HOST` and `REDIS_PORT` environment variables.  If your Redis instance requires a password, supply that in the `REDIS_PASSWORD` environment variable.

TODO Docker instructions...

## Loading the Game Data

TODO (nothing to do yet as the data is still hard coded!).

## Starting the Server

```bash
$ npm run dev
```

Once the server is running, point your browser at `http://localhost:8080`.

## Playing the Game

Use the arrow keys to move around.  Red doors are locked until you have found the appropriate number of keys.  Find all 3 keys and unlock the door in the room you started in to escape.  Touching a flag teleports you to a random other room.

At the end of the game, you'll see how long you took to complete the challenge, and how many times you moved between rooms.

## How it Works

TODO...