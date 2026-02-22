import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_unit", (unitId: string) => {
      socket.join(unitId);
      console.log(`User ${socket.id} joined unit: ${unitId}`);
    });

    socket.on("send_message", (data: any) => {
      // data: { id, text, author, authorUnit, timestamp, channel, recipient }
      if (data.channel === 'global') {
        io.emit("receive_message", data);
      } else if (data.channel === 'unit') {
        io.to(data.authorUnit).emit("receive_message", data);
      } else if (data.channel === 'private' && data.recipient) {
        io.emit("receive_message", data);
      }
    });

    socket.on("send_notification", (data: any) => {
      // data: { id, unit, text, timestamp, read, type }
      io.to(data.unit).emit("receive_notification", data);
    });

    socket.on("send_announcement", (data: any) => {
      // data: { id, author, authorUnit, subject, text, timestamp, taggedUsers }
      io.emit("receive_announcement", data);
    });

    socket.on("send_recado", (data: any) => {
      // data: Recado
      io.to(data.toUnit).emit("receive_recado", data);
      io.to(data.fromUnit).emit("receive_recado", data);
    });

    socket.on("send_recado_response", (data: any) => {
      // data: { recadoId, response, respondedBy, respondedAt, fromUnit, toUnit }
      io.to(data.fromUnit).emit("receive_recado_response", data);
      io.to(data.toUnit).emit("receive_recado_response", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
