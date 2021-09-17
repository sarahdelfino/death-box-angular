const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origins: ["http://localhost:4200"],
  },
});
// const { Server } = require("http");
const { nanoid } = require("nanoid");
var Game = new Object();
const players = [];

app.get("/", (req, res) => {
  res.send("<h1>Hey Socket.io</h1>");
});

io.on('connection', (socket) => {

  const safeJoin = (currentId) => {
    var previousId = '';
    socket.leave(previousId);
    socket.join(currentId);
    console.log(`Socket ${socket.id} joined room ${currentId}`);
    previousId = currentId;
  };
  socket.on("game created", (game) => {
    safeJoin(game.id);
    socket.emit("game", game.id);
    players.push(game.host);
    io.emit('players', players);
  });

  io.emit('players', players);

  socket.on("join game", (game) => {
    io.emit("game", game.id);
    socket.emit("game", game.id);
    players.push(game.name);
    io.emit('players', players);
    safeJoin(game.id);
  })
  socket.on("get game", (id) => {
console.log("get game" + id);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    // players = [];
  });

  socket.on('message', (message) => {
    console.log(message);
    //yes
    io.emit('message', `${socket.id} said ${message}`);
    io.in('message').emit('message', 'the game will start soon');
    socket.to('message').emit('nice game', "let's play a game");
    //yes
    socket.broadcast.emit('message', 'hello friends!');
    socket.emit('message', 'can you hear me?', 1, 2, 'abc');
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});

function getClients(gameId) {
  const clients = app.sockets.adapter.rooms.get(gameId);
  console.log("CLIENTS: " + new Array(...clients).join(', '));
}