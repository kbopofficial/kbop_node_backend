const http = require("http");
const os = require("os");
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
    const networkInterfaces = os.networkInterfaces();
    const ips = [];

    for (const iface of Object.values(networkInterfaces)) {
        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                ips.push(alias.address);
            }
        }
    }

    console.log('\n🚀 Server is up and running!');
    console.log('─────────────────────────────────────────');
    console.log(`  ➜  Local:    http://localhost:${PORT}`);
    ips.forEach(ip => {
        console.log(`  ➜  Network:  http://${ip}:${PORT}`);
    });
    console.log('─────────────────────────────────────────\n');
});

process.on("unhandledRejection", err => {
    console.log(`[unhandledRejection] Shutting down server`);
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});
