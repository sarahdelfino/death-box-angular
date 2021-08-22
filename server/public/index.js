const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { nanoid } = require('nanoid');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const playerCount = 0;
var Game = new Object();
var cnt = 0;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/lobby', (req, res) => {
    console.log(__dirname + '/lobby.html');
    res.sendFile(__dirname + '/lobby.html');
})

server.listen(3000, () => {
    console.log('listening on *:3000');
});

app.all('/secret', function (req, res, next) {
    console.log('Accessing the secret section ...')
    next() // pass control to the next handler
  })

/*io.of("/").adapter.on("create-room", (room) => {
console.log(`room ${room} was created`);
});*/
io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
});

io.on('connection', (socket) => {
    let previousId;

    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId)
        console.log(`Socket ${socket.id} joined room ${currentId}`);
        previousId = currentId;
    }
    console.log('a user connected');
    socket.on('game created', (host) => {
        ++cnt;
        console.log("GAME CREATED WITH CNT: " + cnt + " AND HOST: " + host);
        var id = nanoid(5);
        Game._id = id;
        Game.host = host;
        Game.players = [];
        Game.players.push(host);
        safeJoin(Game._id);
        //socket.join(Game._id);
        io.to(Game._id).emit('game created', Game._id + ' created with host: ' + Game.host, Game._id);
        getClients(Game._id);
    });
    socket.on('game joined', (gameId, player) => {
        safeJoin(gameId);
        //socket.join(gameId);
        Game.players.push(player);
        console.log("PLAYERS: " + Game.players);
        getClients(gameId);
        io.to(gameId).emit('game joined', player + " joined " + gameId);
    })
    /*socket.on('disconnect', () => {
        console.log('user disconnected');
    });*/
});

/*io.use((socket, next) => {
    const host = socket.handshake.auth.host;
    if (!host) {
        return next(new Error("invalid host"));
    }
    socket.host = host;
    next();
});*/


function getClients(gameId) {
    const clients = io.sockets.adapter.rooms.get(gameId);
    console.log("CLIENTS: " + new Array(...clients).join(', '));
}