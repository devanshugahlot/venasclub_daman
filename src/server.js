import express from "express";
import configViewEngine from "./config/configEngine.js";
import routes from "./routes/web.js";
import cronJobContronler from "./controllers/cronJobContronler.js";
import sendMessageAdmin from "./controllers/socketIoController.js";
import { Server } from "socket.io";
import http from "http";
import compression from "compression";

import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 9000;

app.use(compression());
app.use(cookieParser());
// app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// setup viewEngine
configViewEngine(app);

// init Web Routes
routes.initWebRouter(app);

// Fire cronjobcontroller only for one cluster
cronJobContronler.cronJobGame1p(io);

// Check xem ai connect vào sever
sendMessageAdmin(io);

// app.all('*', (req, res) => {
//     return res.render("404.ejs");
// });

server.listen(port, () => {
    console.log("Server is up at port: " + port);
});
