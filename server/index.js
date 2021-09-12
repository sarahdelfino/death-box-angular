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

app.get("/", (req, res) => {
  res.send("<h1>Hey Socket.io</h1>");
});

io.on("connection", (socket) => {
  let previousId;

  const safeJoin = (currentId) => {
    socket.leave(previousId);
    socket.join(currentId);
    console.log(`Socket ${socket.id} joined room ${currentId}`);
    previousId = currentId;
  };
  socket.on("game created", (game) => {
    console.log("GAME CREATED WITH HOST: " + game.host);
    safeJoin(game.id);
    // getClients(game.id);
  });
  socket.on("join game", (game) => {
    console.log("HELLO");
    // getClients(game.id);
    safeJoin(game.id);
    io.to(game.id).emit('game joined', game.players + " joined " + game.id);
  })
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("my message", (msg) => {
    io.emit("my broadcast", `server: ${msg}`);
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});

function getClients(gameId) {
  const clients = app.sockets.adapter.rooms.get(gameId);
  console.log("CLIENTS: " + new Array(...clients).join(', '));
}