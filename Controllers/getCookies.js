const jwt = require('jsonwebtoken');
const getCookies = (token)=>{
    try {
    const data  = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return [data.adminName,data.meetingId];
    } catch (error) {
        console.log("Error in getting token");
        console.log(error);
        return null;
        
    }

}
module.exports = {getCookies}