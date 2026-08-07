import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import router from "./routes/index.js";
import chatSocket from "./sockets/socket.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger/swagger-output.json" with { type: "json" };
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Make io available globally
global.io = io;

// chatSocket(io);

app.get("/check", (req, res) => {
  res.json("Success");
});
const PORT = process.env.PORT || 8010;
server.listen(PORT, () => {
  console.log(`Server running on - ${PORT}`);
});
