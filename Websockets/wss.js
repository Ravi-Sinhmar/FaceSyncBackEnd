// websocket server configration using same app on which express server is running...
const { app } = require("./../app");
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://live-face.vercel.app", // Replace with your React app URL
    methods: ["GET", "POST"]
  }
});


// database models or collections
const meets = require("./../Models/meets");

// custom controllers
const { getCookies } = require("./../Controllers/getCookies");
const {formatString,extractMeetingId} = require('./../Controllers/Common/common');

// const cleanName =  userName.toLowerCase().replace(/\s+/g, "");

const allusers = {};
// handle socket connections
io.on("connection", (socket) => {
  console.log(`Someone connected to socket server and socket id is ${socket.id}`);
  socket.on("join-user", username => {
      console.log(`${username} joined socket connection`);
      allusers[username] = { username, id: socket.id };
      // inform everyone that someone joined
      io.emit("joined", allusers);
  });

  socket.on("offer", ({from, to, offer}) => {
      console.log({from , to, offer });
      io.to(allusers[to].id).emit("offer", {from, to, offer});
  });

  socket.on("answer", ({from, to, answer}) => {
     io.to(allusers[from].id).emit("answer", {from, to, answer});
  });

  socket.on("end-call", ({from, to}) => {
      io.to(allusers[to].id).emit("end-call", {from, to});
  });

  socket.on("call-ended", caller => {
      const [from, to] = caller;
      io.to(allusers[from].id).emit("call-ended", caller);
      io.to(allusers[to].id).emit("call-ended", caller);
  })

  socket.on("icecandidate", candidate => {
      console.log({ candidate });
      //broadcast to other peers
      socket.broadcast.emit("icecandidate", candidate);
  }); 
})

module.exports = server;
