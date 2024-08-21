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
const {formatString,extractMeetingId} = require('./../Controllers/Common/common');

// const cleanName =  userName.toLowerCase().replace(/\s+/g, "");

const allConnections = new Map();

wss.on("connection", async(ws, req) => {
  let userName = null;
  let name = null;
 const url = req.url;
const parts = url.split('userName=')[1];
 userName = parts.split('&name=')[0];
name = parts.split('&name=')[1];
name = formatString(name);
let meetingId = extractMeetingId(userName);
try {
  const meet = await meets.findOne({meetingId:meetingId});
  const cleanName = meet.adminName.toLowerCase().replace(/\s+/g, "");
  if(name === cleanName){
  name = meet.adminName;
}
} catch (error) {
  console.log("In Catch",error);
}
console.log(name);
  allConnections.set(userName,ws);

 
ws.on("message", async (message) => {
  const msg = JSON.parse(message);
  console.log("got the message",msg);
  const cleanName =  msg.userName.toLowerCase().replace(/\s+/g, "");
  let fcleanName =  msg.friendName.toLowerCase().replace(/\s+/g, "");
  fcleanName = `${fcleanName}${meetingId}`;
if(`${cleanName}${meetingId}`===  userName){
  console.log("Id matchad");
}

 if(allConnections.has(userName) && allConnections.has(fcleanName)){
 const fws = allConnections.get(fcleanName)
  if(fws.readyState === WebSocket.OPEN){
    console.log("message sent to fws",fcleanName);
    fws.send(JSON.stringify(msg));
  }
 }


});




  ws.on("error", (err) => {
    console.error(`Error from ws.on error ${err}`);
  });


  ws.on("close", async () => {
    console.log("User Disconnected");
    allConnections.delete(userName);
  });
});

module.exports = server;
