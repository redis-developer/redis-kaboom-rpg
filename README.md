# Redis Kaboom RPG Type Game

This is an RPG maze type game built with [Kaboom.js](https://kaboomjs.com/), [Node.js](https://nodejs.org/) and [Redis](https://redis.io).  It makes use of the [RedisJSON](https://redisjson.io) module from [Redis Labs](https://redislabs.com).

TODO GIF OF THE GAME...

## Setup

To run this game, you'll need [Docker](https://www.docker.com/) (or a local Redis instance, version 5 or higher with the RedisJSON module installed) and [Node.js](https://nodejs.org/) (use the current LTS version).  First, clone the repo and install the dependencies:

```bash
$ git clone https://github.com/simonprickett/redis-kaboom-rpg.git
$ cd redis-kaboom-rpg
$ npm install
```

### Redis Setup

This game uses Redis as a data store.  The code assumes that Redis is running on localhost port 6379 unless you provide an alternative Redis host and port by setting the `REDIS_HOST` and `REDIS_PORT` environment variables.  If your Redis instance requires a password, supply that in the `REDIS_PASSWORD` environment variable.  You'll need to have the RedisJSON module installed.

You can also use Docker to get a Redis instance with RedisJSON:

```bash
$ docker-compose up -d
Creating network "redis-kaboom-rpg_default" with the default driver
Creating redis_kaboom ... done
$
```

Redis will create a folder `redisdata` and write the append-only file there, so your data is persisted if you stop and restart the Docker container.

### Loading the Game Data

Next, load the game map into Redis.  This stores the map data in the `game_map.json` file in Redis, using RedisJSON:

```bash
$ npm run load

> redis-kaboom-rpg@1.0.0 load
> node src/data_loader.js

Data loaded!
$
```

You only need to do this once.

### Starting the Server

To start the game server:

```bash
$ npm run dev
```

Once the server is running, point your browser at `http://localhost:8080`.

This starts the server using [nodemon](https://www.npmjs.com/package/nodemon), so any changes to the source code files will restart the server for you.

If the server logs an error similar to this one, then Redis isn't running on the expected / configured host / port:

```
[ioredis] Unhandled error event: Error: connect ECONNREFUSED 127.0.0.1:6379
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1146:16)
```

### Stopping the Server

To stop the Node.js server, press Ctrl-C.

### Stopping Redis (Docker)

If you started Redis using `docker-compose`, stop it as follows when you are done playing the game:

```bash
$ docker-compose down
Stopping redis_kaboom ... done
Removing redis_kaboom ... done
Removing network redis-kaboom-rpg_default
$
```

### Playing the Game

Press space to start, then use the arrow keys to move your character.  Red doors are locked until you have found the appropriate number of keys.  Touch a red door to find out how many keys are required, or pass through it if you have enough keys.

Find all 3 keys and unlock the door in the room you started in (room 0) to escape.  Touching a flag teleports you to a random other room.

At the end of the game, you'll see how long you took to complete the challenge, and how many times you moved between rooms.

## How it Works

TODO...

### Project Structure

The project consists of a Node.js back end that has API routes for some of the game logic and a static server for the front end.

The back end code lives in the `src` folder, along with the data loader code, used to load the game room map into Redis.  It uses the Express framework.  Redis connectivity is handled using the ioredis client.

The front end is written in JavaScript using Kaboom.js and the Bulma CSS framework.  It lives in the `public` folder.

### Working with Kaboom.js

TODO

### Using Redis as a Data Store

This game uses the following Redis data types and features:

* **JSON (using the RedisJSON module)**: The tile map for each level (describing where the walls, doors, keys, flags and player's initial position are) is stored in Redis in a single key using RedisJSON.  The data loader uses the `JSON.SET` command to store the data, and the Node.js back end retrieves the map for a given room with the `JSON.GET` command.  The data is stored as a JSON array in Redis, and we use the `JSON.ARRLEN` command whenever we need to know how many rooms are in the map (for example when choosing a random room to teleport the user to when they touch a flag).
* **Streams**: Each new game gets its own Stream, and each time the player enters a new room an entry is written to the Stream.  At the end of the game, data from the Stream is used to determine:
  * How many times the player entered a room (using the `XLEN` command).
  * How long the player took to complete the game (each Stream entry is timestamped, so we can calculate the game duration as the difference between the timestamps of the first and last entries).  For this we use the `XRANGE` and `XREVRANGE` commands.
* **Sets**: TODO
* **Key expiry**: We use the `EXPIRE` command to ensure that keys associated with each game are removed from Redis after a day.  This ensures that we don't have uncontrolled data growth in Redis, for example because the player abandons the game.  When the player wins the game, keys are tidied up immediately using the `DEL` command.
