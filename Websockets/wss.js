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
let ADMIN = null;
let FRIEND = null;
wss.on("connection", async(ws, req) => {
 let cleanUserName = null;
 let fullUserName = null;
 let cleanFriendName = null;
 let fullFiendName = null;
 let fullMeetId = null;
 let isValid = false;
 const url = req.url;
const parts = url.split('fullMeetId=')[1];
fullMeetId = parts.split('&deviceName=')[0];
cleanUserName = parts.split('&deviceName=')[1];

cleanUserName = formatString(cleanUserName);
let meetingId = extractMeetingId(fullMeetId);

try {
  console.log(meetingId);
  const meet = await meets.findOne({meetingId:meetingId});
  if(!meet){
    ws.close();
}else{
  isValid = true;
  ADMIN = meet.adminName;
}
} catch (error) {
  console.log("In Catch",error);
}



ws.on("message", async (message) => {
  let msg = JSON.parse(message);
  let cleanName = null;
  if(msg.admin){

  msg.fullUserName = ADMIN;
  cleanName = msg.cleanUserName;
  if(FRIEND){
    msg.cleanFriendName = FRIEND.toLowerCase().replace(/\s+/g, "");
    msg.fullFiendName = FRIEND;
  }
  }else{
    cleanName = msg.cleanFriendName;
   msg.fullFiendName = ADMIN;
  }
  let fcleanName = msg.cleanFriendName;
  fcleanName = `${fcleanName}${meetingId}`;
if(`${cleanName}${meetingId}`===  fullMeetId){
  console.log("Id matchad");
}else{
  isValid = false;
  ws.close();
}
 if(allConnections.has(fullMeetId) && allConnections.has(fcleanName) && isValid){
 const fws = allConnections.get(fcleanName)
  if(fws.readyState === WebSocket.OPEN){
    fws.send(JSON.stringify(msg));
  }
 }
});

  ws.on("error", (err) => {
    console.error(`Error from ws.on error ${err}`);
    ws.close();
  });


  ws.on("close", async () => {
    console.log("User Disconnected");
    allConnections.delete(fullMeetId);
  });
});

module.exports = server;
