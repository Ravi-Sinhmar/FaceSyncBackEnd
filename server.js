//  Entery File
// .env config
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const port = process.env.PORT || 3000;

// Importing Database connection module
const connection = require("./Database/connection");

// Imporing server form app.js
const server = require("./Websockets/wss");


// Server is listening
server.listen(port || 5000, () => {
  console.log(
    `Server is listening at port ${port}`
  );
});
