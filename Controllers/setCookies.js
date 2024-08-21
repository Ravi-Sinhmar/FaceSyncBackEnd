const jwt = require('jsonwebtoken');
function setCookies(meet){
    const meetingId = meet.meetingId;
    const adminName = meet.adminName;
    const createdAt = meet.createdAt;
    

    // let generate jwt tockets here
    const daysToExpire = 15;
    const secondsPerDay = 24 * 60 * 60;
    const expiresIn = daysToExpire * secondsPerDay;
    const payload = {meetingId, adminName,createdAt};
    try {
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn});
    if(token){
      return token;
    }
    else{
     return console.log("not tocken")
    }
    } catch (error) {
      console.log(error);
    }

  }
  module.exports = setCookies;