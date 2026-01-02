const http = require("http");
const dotenv = require("dotenv");

process.on("uncaughtException", err => {
    console.log(`[uncaughtException] Shutting down server ...`);
    console.log(err.name, err.message);
    console.log(err);
    process.exit(1);
});

dotenv.config({ path: './.env' });

const app = require('./app');

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

const server = httpServer.listen(PORT, '0.0.0.0', () => {
    console.log("Server is running on port", PORT);
});

process.on("unhandledRejection", err => {
    console.log(`[unhandledRejection] Shutting down server`);
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});
