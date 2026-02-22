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
  if (usersData.length === 0) {
    usersData = [{ username: 'ADMIN', units: ['Viana-ES'], personalPassword: 'admin', role: 'ADMINISTRADOR' }];
    saveData(USERS_FILE, usersData);
  }
  let notesData = loadData(NOTES_FILE, {});
  let reviewsData = loadData(REVIEWS_FILE, []);

  const PORT = 3000;

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send initial data to the connected client
    socket.on("request_initial_data", () => {
      socket.emit("initial_data", { appData, usersData, notesData, reviewsData });
    });

    socket.on("join_unit", (unitId: string) => {
      socket.join(unitId);
      console.log(`User ${socket.id} joined unit: ${unitId}`);
    });

    // --- DATA MUTATIONS ---

    socket.on("add_protocol", (entry: any) => {
      appData.entries.unshift(entry);
      appData.nextProtocol = (entry.protocol || appData.nextProtocol) + 1;
      appData.lastAuthor = entry.author;
      saveData(DATA_FILE, appData);
      io.emit("protocol_added", entry);
    });

    socket.on("update_entry", (data: { id: string, updates: any }) => {
      let found = false;
      appData.entries = appData.entries.map((e: any) => {
        if (e.id === data.id) {
          found = true;
          return { ...e, ...data.updates };
        }
        return e;
      });
      
      if (!found) {
        appData.iscaControlEntries = appData.iscaControlEntries.map((e: any) => {
          if (e.id === data.id) return { ...e, ...data.updates };
          return e;
        });
      }
      
      saveData(DATA_FILE, appData);
      io.emit("entry_updated", data);
    });

    socket.on("delete_entry", (id: string) => {
      appData.entries = appData.entries.filter((e: any) => e.id !== id);
      appData.iscaControlEntries = appData.iscaControlEntries.filter((e: any) => e.id !== id);
      saveData(DATA_FILE, appData);
      io.emit("entry_deleted", id);
    });

    socket.on("add_isca_control", (entry: any) => {
      appData.iscaControlEntries.unshift(entry);
      appData.lastAuthor = entry.author;
      saveData(DATA_FILE, appData);
      io.emit("isca_control_added", entry);
    });

    socket.on("add_unit_tab", (unit: any) => {
      appData.unitTabs.push(unit);
      saveData(DATA_FILE, appData);
      io.emit("unit_tab_added", unit);
    });

    socket.on("update_unit_tab", (data: { id: string, updates: any }) => {
      appData.unitTabs = appData.unitTabs.map((u: any) => u.id === data.id ? { ...u, ...data.updates } : u);
      saveData(DATA_FILE, appData);
      io.emit("unit_tab_updated", data);
    });

    socket.on("delete_unit_tab", (id: string) => {
      appData.unitTabs = appData.unitTabs.filter((u: any) => u.id !== id);
      saveData(DATA_FILE, appData);
      io.emit("unit_tab_deleted", id);
    });

    socket.on("signup_user", (newUser: any) => {
      if (!usersData.some((u: any) => u.username.toUpperCase() === newUser.username.toUpperCase())) {
        usersData.push(newUser);
        saveData(USERS_FILE, usersData);
        io.emit("user_signed_up", newUser);
      }
    });

    socket.on("update_user_profile", (data: { username: string, updates: any }) => {
      usersData = usersData.map((u: any) => 
        u.username.toUpperCase() === data.username.toUpperCase() ? { ...u, ...data.updates } : u
      );
      saveData(USERS_FILE, usersData);
      io.emit("user_profile_updated", data);
    });

    socket.on("update_all_users", (newUsers: any) => {
      usersData = newUsers;
      saveData(USERS_FILE, usersData);
      io.emit("users_data_updated", usersData);
    });

    socket.on("update_user_notes", (data: { username: string, notes: any[] }) => {
      notesData[data.username.toUpperCase()] = data.notes;
      saveData(NOTES_FILE, notesData);
      // Only send back to the user's other devices if needed, but broadcast is simpler
      io.emit("notes_updated", data);
    });

    socket.on("add_review", (review: any) => {
      reviewsData.push(review);
      saveData(REVIEWS_FILE, reviewsData);
      io.emit("review_added", review);
    });

    socket.on("send_message", (data: any) => {
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
