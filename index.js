var express = require("express");
const http = require("http");
var app = express();
const server = http.createServer(app);

const socketIo = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

let numUsers = 0;
let usersConnected = [];

socketIo.on("connection", (socket) => {
  // usersConnected.push(socket)
  
  let addedUser = false;

  socket.emit("getId", socket.id);

  socket.on("sendDataClient", function (data) {
    socketIo.emit("sendDataServer", { data });
  });

  socket.on("addUser", (username) => {
    if (addedUser) return;

    socket.username = username;
    console.log(socket.username);
    ++numUsers;
    addedUser = true;
    socket.emit("login", {
      numUsers: numUsers,
    });

    socket.emit("user joined", {
      username: socket.username,
      numUsers: numUsers,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // usersConnected.splice(usersConnected.indexOf(socket), 1);
    // console.log(usersConnected);
  });

});

server.listen(3000, () => {
  console.log("Running server on port 3000");
});
