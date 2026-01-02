const http = require("http")
const dotenv = require("dotenv")

process.on("uncaughtException", err => {
    console.Log(`[uncaughtException] Shutting down server ...`);
    console.Log(err.name, err.message);
    console.Log(err);
    process.exit(1);
})

dotenv.config({path:'./.env'})
const app=require('./app')

var httpServer=http.createServer(app);

const server=httpServer.listen(process.env.PORT,()=>{
console.log("Server is running on", process.env.PORT)
})

process.on("unhandledRejection",err=>{
console.log(`[unhandledRejection] shutting down server`);
console.log(err);
server.close(()=>{
    process.exit(1);
})
})