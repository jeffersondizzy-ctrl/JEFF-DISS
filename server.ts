import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");
const USERS_FILE = path.join(__dirname, "users.json");
const NOTES_FILE = path.join(__dirname, "notes.json");
const REVIEWS_FILE = path.join(__dirname, "reviews.json");

// Helper to load data
const loadData = (file: string, defaultData: any) => {
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch (e) {
      console.error(`Error loading ${file}:`, e);
    }
  }
  return defaultData;
};

// Helper to save data
const saveData = (file: string, data: any) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error saving ${file}:`, e);
  }
};

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  let appData = loadData(DATA_FILE, {
    entries: [],
    iscaControlEntries: [],
    messages: [],
    notifications: [],
    unitTabs: [],
    lastAuthor: '',
    nextProtocol: 1,
    announcements: [],
    recados: []
  });

  let usersData = loadData(USERS_FILE, []);
  let notesData = loadData(NOTES_FILE, {});
  let reviewsData = loadData(REVIEWS_FILE, []);

  const PORT = 3000;

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send initial data to the connected client
    socket.emit("initial_data", { appData, usersData, notesData, reviewsData });

    socket.on("join_unit", (unitId: string) => {
      socket.join(unitId);
      console.log(`User ${socket.id} joined unit: ${unitId}`);
    });

    socket.on("update_app_data", (newData: any) => {
      appData = newData;
      saveData(DATA_FILE, appData);
      // Broadcast to all other clients
      socket.broadcast.emit("app_data_updated", appData);
    });

    socket.on("update_users_data", (newUsers: any) => {
      usersData = newUsers;
      saveData(USERS_FILE, usersData);
      // Broadcast to all other clients
      socket.broadcast.emit("users_data_updated", usersData);
    });

    socket.on("update_notes_data", (newNotes: any) => {
      notesData = newNotes;
      saveData(NOTES_FILE, notesData);
      // Broadcast to all other clients
      socket.broadcast.emit("notes_data_updated", notesData);
    });

    socket.on("update_reviews_data", (newReviews: any) => {
      reviewsData = newReviews;
      saveData(REVIEWS_FILE, reviewsData);
      // Broadcast to all other clients
      socket.broadcast.emit("reviews_data_updated", reviewsData);
    });

    socket.on("send_message", (data: any) => {
      // Update local state and save
      appData.messages.push(data);
      saveData(DATA_FILE, appData);

      if (data.channel === 'global') {
        io.emit("receive_message", data);
      } else if (data.channel === 'unit') {
        io.to(data.authorUnit).emit("receive_message", data);
      } else if (data.channel === 'private' && data.recipient) {
        io.emit("receive_message", data);
      }
    });

    socket.on("send_notification", (data: any) => {
      appData.notifications.unshift(data);
      saveData(DATA_FILE, appData);
      io.to(data.unit).emit("receive_notification", data);
    });

    socket.on("send_announcement", (data: any) => {
      appData.announcements.unshift(data);
      saveData(DATA_FILE, appData);
      io.emit("receive_announcement", data);
    });

    socket.on("send_recado", (data: any) => {
      appData.recados.unshift(data);
      saveData(DATA_FILE, appData);
      io.to(data.toUnit).emit("receive_recado", data);
      io.to(data.fromUnit).emit("receive_recado", data);
    });

    socket.on("send_recado_response", (data: any) => {
      appData.recados = appData.recados.map((r: any) => r.id === data.recadoId ? {
        ...r,
        status: 'responded',
        response: data.response,
        respondedBy: data.respondedBy,
        respondedAt: data.respondedAt
      } : r);
      saveData(DATA_FILE, appData);
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
