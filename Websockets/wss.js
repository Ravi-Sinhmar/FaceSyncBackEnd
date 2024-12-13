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

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    console.log("Server (room:join):Email , room",email,room);
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    const updatedTo = emailToSocketIdMap.get('ad@gmail.com');
    console.log("Server (user:call):to , offer",emailToSocketIdMap.get('ad@gmail.com'),offer);
    console.log("Email is of admin is and socket.id",'ad@gmail.com',emailToSocketIdMap.get('ad@gmail.com'));
    io.to(updatedTo).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    console.log("Server (call:accepted):to , ans",to,ans);

    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("Server (peer:nego:needed):to , offer",to,offer);

    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("Server (peer:nego:done):to , ans",to,ans);
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

module.exports = server;