# Redis Kaboom RPG Type Game

This is an RPG maze type game built with [Kaboom.js](https://kaboomjs.com/), [Node.js](https://nodejs.org/) and [Redis](https://redis.io).  It makes use of the [RedisJSON](https://redisjson.io) module from [Redis Labs](https://redislabs.com).

![Demo of the game running](redis_kaboom_game.gif)

## Setup

To run this game, you'll need [Docker](https://www.docker.com/) (or a local Redis instance, version 5 or higher with the RedisJSON module installed) and [Node.js](https://nodejs.org/) (use the current LTS version).  First, clone the repo and install the dependencies:

```bash
$ git clone https://github.com/simonprickett/redis-kaboom-rpg.git
$ cd redis-kaboom-rpg
$ npm install
```

### Redis Setup

This game uses Redis as a data store.  The code assumes that Redis is running on localhost port 6379.  You can configure an alternative Redis host and port by setting the `REDIS_HOST` and `REDIS_PORT` environment variables.  If your Redis instance requires a password, supply that in the `REDIS_PASSWORD` environment variable.  You'll need to have the RedisJSON module installed.

You can also use Docker to get a Redis instance with RedisJSON:

```bash
$ docker-compose up -d
Creating network "redis-kaboom-rpg_default" with the default driver
Creating redis_kaboom ... done
$
```

Redis creates a folder named `redisdata` (inside the `redis-kaboom-rpg` folder that you cloned the GitHub repo to) and writes its append-only file there.  This ensures that your data is persisted periodically and will still be there if you stop and restart the Docker container.

### Loading the Game Data

Next, load the game map into Redis.  This stores the map data from the `game_map.json` file in Redis, using RedisJSON:

```bash
$ npm run load

> redis-kaboom-rpg@1.0.0 load
> node src/data_loader.js

Data loaded!
$
```

You only need to do this once.  Verify that the data loaded by ensuring that the key `kaboom:rooms` exists in Redis and is a RedisJSON document:

```bash
127.0.0.1:6379> type kaboom:rooms
ReJSON-RL
```

### Starting the Server

To start the game server:

```bash
$ npm run dev
```

Once the server is running, point your browser at `http://localhost:8080`.

This starts the server using [nodemon](https://www.npmjs.com/package/nodemon), so saving changes to the source code files restarts the server for you automatically.

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

Press space to start, then use the arrow keys to move your character.  Red doors are locked until you have found the appropriate number of keys.  Touch a red door to find out how many keys are required, or pass through it if you have enough keys.  Green doors are unlocked and don't require keys.

Find all 3 keys and unlock the door in the room you started in (room 0) to escape.  Touching a flag teleports you to a random other room.

At the end of the game, you'll see how long you took to complete the challenge, and how many times you moved between rooms.

## How it Works

Let's take a look at how the different components of the game architecture fit together.

### Project Structure

The project consists of a Node.js back end that has API routes for some of the game logic and a static server for the front end.

The back end code lives in the `src` folder, along with the data loader code, used to load the game room map into Redis.  It uses the [Express framework](https://expressjs.com/) both to serve the front end HTML / JavaScript / CSS and image files, and also to implement a small API for starting and tracking game events.  Redis connectivity is handled using the [ioredis client](https://www.npmjs.com/package/ioredis).

The front end is written in JavaScript using [Kaboom.js](https://kaboomjs.com/) as the game engine, and the [Bulma CSS framework](https://bulma.io/) for some basic layout.  It lives in the `public` folder.

### Working with Kaboom.js

TODO

### Using Redis as a Data Store

This game uses the following Redis data types and features:

* **JSON (using the RedisJSON module)**: The tile map for each level (describing where the walls, doors, keys, flags and player's initial position are) is stored in Redis in a single key using RedisJSON.  The data loader uses the `JSON.SET` command to store the data in a Redis key named `kaboom:rooms`.  The Node.js back end retrieves the map for a given room with the `JSON.GET` command.  Room data is stored as a JSON array in Redis.  Each room's data is an object in the array: room 0 is the 0th array element, room 1 the first and so on.  We use the `JSON.ARRLEN` command whenever we need to know how many rooms are in the map (for example when choosing a random room to teleport the user to when they touch a flag).  Each room's data looks like this:

```json
{
  "layout": [
    "============",
    "=          =",
    "=          =",
    "=     k    =",
    "=    ==    =",
    "1  f  @=   2",
    "=     ==   =",
    "=          =",
    "=          =",
    "=          =",
    "============"
  ],
  "doors": {
    "1": {
      "leadsTo": 5
    },
    "2": {
      "leadsTo": 3,
      "keysRequired": 3,
      "isEnd": true
    }
  }
}
```
  * The `layout` array contains the tilemap for the room, which Kaboom uses in the front end to render the appropriate tiles. `=` is a solid wall, `@` is the position that the player starts in when they enter the room, `f` is a teleporter flag, and numeric characters are doors to other rooms.
  * Each door is further described in the `doors` object.  In the example above, door 1 leads to room 5, and door 2 to room 3.  Door 2 is locked and the player requires 3 keys to pass through it.  Door 2 is also the special `isEnd` door, which represents the escape point from the maze.
* **Streams**: Each new game gets its own Stream.  We use the timestamp when the game began as part of the key name, for example `kaboom:moves:1625561580120`.  Each time the player enters a new room an entry is written to the Stream (using the `XADD` command).  At the end of the game, data from the Stream is used to determine:
  * How many times the player entered a room (using the `XLEN` command).
  * How long the player took to complete the game (each Stream entry is timestamped, so we can calculate the game duration as the difference between the timestamps of the first and last entries).  For this we use the `XRANGE` and `XREVRANGE` commands.
  * Each Stream entry looks like this:

```bash
127.0.0.1:6379> xrevrange kaboom:moves:1625561580120 + - count 1
1) 1) "1625561643258-0"
   2) 1) "roomEntry"
      2) "1"
```
  * Additionally, we write a "start" event to the Stream when the game starts, so that we get the timestamp of the start of the game in the Stream, rather than waiting until the player first moves to another room to start the game clock.  The "start" event will always be the first entry in the Stream, and looks like this:

```bash
127.0.0.1:6379> xrange kaboom:moves:1625561580120 - + count 1
1) 1) "1625561580122-0"
   2) 1) "event"
      2) "start"
```
* **Sets**: Every time the player begins a new game, the code "hides" the keys that the player needs to find to escape.  It does this by putting random room numbers into a Redis Set until there are 3 members there, using the `SADD` and `SCARD` commands for this.  There needs to be one set per running game, so we use the timestamp that the game was started as part of the key, for example `kaboom:keylocations:1625561580120`. The `SISMEMBER` commmand is used to check if a room number should have a key in it when sending the room map to the front end.  If it should, then the `k` (key sprite) character is left in the room map, otherwise it's removed before sending the map to the front end.  Each new game has its own set, containing three room numbers like so:

```bash
127.0.0.1:6379> smembers kaboom:keylocations:1625561580120
1) "5"
2) "17"
3) "29"
```
* **Key Expiry**: We use the `EXPIRE` command to ensure that keys associated with each game are removed from Redis after a day.  This ensures that we don't have uncontrolled data growth in Redis, for example because the player abandons the game.  When the player wins the game, keys are tidied up immediately using the `DEL` command.  Here, I'm looking at the time to live for a game's Stream key with the `TTL` command:

```bash
127.0.0.1:6379> ttl kaboom:moves:1625561580120
(integer) 86210
```
