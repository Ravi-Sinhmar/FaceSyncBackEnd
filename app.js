// .env config
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();

// Importing Database connection module
const meets = require("./Models/meets");
const setCookies = require("./Controllers/setCookies");
const checkCookie = require("./Middleware/checkCookies");
const { getCookies } = require("./Controllers/getCookies");



// Middleware
app.use(
  cors({
    origin: "https://live-face.vercel.app", // Allow requests from this origin
    methods: "GET, POST, PUT, DELETE", // Allowed methods
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));


// Test API

app.get("/", (req, res) => {
  console.log("GET Request /");
  res.status(200).json({status:'success',message:'I am runnning'})
});

// Api 1
app.post("/saveMeet", async (req, res) => {
  if (req.body.adminName && req.body.meetingId) {
    try {
      const meet = await meets.create(req.body);
      if (meet) {
        const token = setCookies(meet); // Generate token
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure:true,
        });
     console.log("SuccessFully Saved Data in Data Base");
        return res
          .status(201)
          .json({ status: "success", message: "created" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "fail", message: "not created" });
    }
  } else {
    return res
      .status(404)
      .json({ status: "fail", message: "No username or meetingId" });
  }
});
// http://localhost:3000/meeting/?adminName=ravisinhmar&meetingId=503385
// http://localhost:3000/meeting/?adminName=ravisinhmar&meetingId=503385
// http://localhost:3000/meeting/?adminName=chromeboy&meetingId=586379
// Api 2





app.post("/local",(req,res)=>{
try {
  console.log("I got the local");
console.log(req.body);
  if(req.body){ 
    res.status(200).json({status:'success',message:"req.body is true"})
  }else{res.status(404).json({status:'fail',message:'no req.boyd'})}
} catch (error) {
  console.log(error);
  res.status(500).json({status:'fail',message:error});
}

});




app.post("/seeMeet", checkCookie, async (req, res) => {
  try {
const meet = await meets.findOne({ meetingId: req.body.meetingId });
if(!req.token && meet.adminName){
  console.log("NO tokens , means another user");
 return res.status(200).json({status:'success',token:false});
}
if(req.token && meet.adminName){
  let adminName1 = req.adminName.toLowerCase().replace(/\s+/g, "");
  let adminName2 = req.body.adminName.toLowerCase().replace(/\s+/g, "");
  let adminName3 = meet.adminName.toLowerCase().replace(/\s+/g, "");
  if(adminName1 === adminName2 && adminName2 === adminName3){
    console.log("Have token , means admin");
   return res.status(200).json({status:'success',token:true});
  }
  if(adminName1 !== adminName2 || adminName2 !== adminName3){
    console.log("Have token , But not the current one admin");
   return res.status(200).json({status:'success',token:false});
  }
}
  } catch (error) {
    console.log("In catch and error is::",error);
   return res.status(500).json({status:'fail',message:"500"});
  }
});

module.exports = { app };
