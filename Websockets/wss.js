// websocket server configration using same app on which express server is running...
const { app } = require("./../app");
const http = require("http");
const server = http.createServer(app);
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });

// database models or collections
const meets = require("./../Models/meets");

// custom controllers
const { getCookies } = require("./../Controllers/getCookies");
const {
  formatString,
  extractMeetingId,
} = require("./../Controllers/Common/common");

// const cleanName =  userName.toLowerCase().replace(/\s+/g, "");

// Global Varibales
const allConnections = new Map(); //Array to Store Websockets of both the connection

wss.on("connection", async (ws, req) => {
  const url = req.url;
  const parts = url.split("fullMeetId=")[1];
  const meetingId = parts.split("__.")[0];
  const type = parts.split("__.")[1];

  try {
    const meet = await meets.findOne({ meetingId: meetingId });
    if (meet) {
      allConnections.set(type, ws);
      console.log("Connected",type);
    } else {
      ws.close();
    }
  } catch (error) {
    console.log("In Catch", error);
    ws.close();
  }
  // If Message Comes
  ws.on("message", async (message) => {
    let msg = await JSON.parse(message);
    // let msg = message
    console.log("got messg", msg);
    let sender = null;
    let receiver = null;
    if (msg.admin) {
      sender = "ad";
      receiver = "us";
    } else {
      sender = "us";
      receiver = "ad";
    }
    if (allConnections.has(sender) && allConnections.has(receiver)) {
      const receiverWs = allConnections.get(receiver);
      const senderWs = allConnections.get(sender);
  
      if (receiverWs.readyState === WebSocket.OPEN) {
        receiverWs.send(JSON.stringify({ ...msg, status: "both" }));
      }
  
      if (senderWs.readyState === WebSocket.OPEN) {
        senderWs.send(JSON.stringify({ ...msg, status: "both" }));
      }
    } else if (allConnections.has(sender)) {
      const fws = allConnections.get(sender);
      if (fws.readyState === WebSocket.OPEN) {
        fws.send(JSON.stringify({ OnlyAvailable: sender }));
      }
    } else if (allConnections.has(receiver)) {
      const fws = allConnections.get(receiver);
      if (fws.readyState === WebSocket.OPEN) {
        fws.send(JSON.stringify({ OnlyAvailable: receiver }));
      }
    }
  });

  // If Error Comes
  ws.on("error", (err) => {
    console.error(`Error from ws.on error ${err}`);
  });

  // If WebSocket Closes
  ws.on("close", async () => {
    console.log("User Disconnected");
    allConnections.delete(type);
  });
});

module.exports = server;
