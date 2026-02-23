import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { supabase } from "./supabaseClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");
const USERS_FILE = path.join(__dirname, "users.json");
const NOTES_FILE = path.join(__dirname, "notes.json");
const REVIEWS_FILE = path.join(__dirname, "reviews.json");

// Helper to load data from Supabase with local fallback
const loadData = async (table: string, file: string, defaultData: any) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('app_persistence').select('content').eq('key', table).single();
      if (data && !error) {
        return data.content;
      }
    }
  } catch (e) {
    console.error(`Supabase load error for ${table}:`, e);
  }

  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch (e) {
      console.error(`Error loading local ${file}:`, e);
    }
  }
  return defaultData;
};

// Helper to save data to Supabase and local file
const saveData = async (table: string, file: string, content: any) => {
  try {
    if (supabase) {
      // Try to update Supabase
      const { error } = await supabase.from('app_persistence').upsert({ key: table, content, updated_at: new Date() });
      if (error) console.error(`Supabase save error for ${table}:`, error);
    }
  } catch (e) {
    console.error(`Supabase save exception for ${table}:`, e);
  }

  try {
    fs.writeFileSync(file, JSON.stringify(content, null, 2));
  } catch (e) {
    console.error(`Error saving local ${file}:`, e);
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

  let appData = await loadData("app_data", DATA_FILE, {
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

  let usersData = await loadData("users_data", USERS_FILE, []);
  if (usersData.length === 0) {
    usersData = [{ 
      username: 'JEFFERSON', 
      units: ['Santa Luzia-MG', 'Montes Claros-MG', 'Viana-ES', 'Cuiabá-MT'], 
      personalPassword: '#trescafe27', 
      role: 'ADMINISTRADOR' 
    }];
    await saveData("users_data", USERS_FILE, usersData);
  }
  let notesData = await loadData("notes_data", NOTES_FILE, {});
  let reviewsData = await loadData("reviews_data", REVIEWS_FILE, []);

  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Track the user associated with this socket
    let authenticatedUser: any = null;

    // Send initial data to the connected client
    socket.on("request_initial_data", () => {
      socket.emit("initial_data", { appData, usersData, notesData, reviewsData });
    });

    socket.on("login", (credentials: { username: string, password: any }) => {
      console.log(`Login attempt for user: ${credentials.username}`);
      const user = usersData.find((u: any) => 
        u.username.toUpperCase() === credentials.username.toUpperCase() && 
        u.personalPassword === credentials.password
      );
      if (user) {
        authenticatedUser = user;
        socket.emit("login_success", user);
        console.log(`User ${user.username} authenticated successfully on socket ${socket.id}`);
      } else {
        console.warn(`Login failed for user: ${credentials.username}`);
        socket.emit("login_error", "ACESSO NEGADO: ID OU SENHA INCORRETOS");
      }
    });

    socket.on("join_unit", (unitId: string) => {
      socket.join(unitId);
      console.log(`User ${socket.id} joined unit: ${unitId}`);
    });

    // Middleware-like check for mutations
    const isAuth = () => {
      if (!authenticatedUser) {
        console.warn(`Unauthorized mutation attempt on socket ${socket.id}`);
        socket.emit("error", "Não autorizado. Por favor, faça login novamente.");
        return false;
      }
      return true;
    };

    // --- DATA MUTATIONS ---

    socket.on("add_protocol", async (entry: any) => {
      if (!isAuth()) return;
      appData.entries.unshift(entry);
      appData.nextProtocol = (entry.protocol || appData.nextProtocol) + 1;
      appData.lastAuthor = entry.author;
      await saveData("app_data", DATA_FILE, appData);
      io.emit("protocol_added", entry);
    });

    socket.on("update_entry", async (data: { id: string, updates: any }) => {
      if (!isAuth()) return;
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
      
      await saveData("app_data", DATA_FILE, appData);
      io.emit("entry_updated", data);
    });

    socket.on("delete_entry", async (id: string) => {
      if (!isAuth()) return;
      appData.entries = appData.entries.filter((e: any) => e.id !== id);
      appData.iscaControlEntries = appData.iscaControlEntries.filter((e: any) => e.id !== id);
      await saveData("app_data", DATA_FILE, appData);
      io.emit("entry_deleted", id);
    });

    socket.on("add_isca_control", async (entry: any) => {
      if (!isAuth()) return;
      appData.iscaControlEntries.unshift(entry);
      appData.lastAuthor = entry.author;
      await saveData("app_data", DATA_FILE, appData);
      io.emit("isca_control_added", entry);
    });

    socket.on("add_unit_tab", async (unit: any) => {
      if (!isAuth()) return;
      appData.unitTabs.push(unit);
      await saveData("app_data", DATA_FILE, appData);
      io.emit("unit_tab_added", unit);
    });

    socket.on("update_unit_tab", async (data: { id: string, updates: any }) => {
      if (!isAuth()) return;
      appData.unitTabs = appData.unitTabs.map((u: any) => u.id === data.id ? { ...u, ...data.updates } : u);
      await saveData("app_data", DATA_FILE, appData);
      io.emit("unit_tab_updated", data);
    });

    socket.on("delete_unit_tab", async (id: string) => {
      if (!isAuth()) return;
      appData.unitTabs = appData.unitTabs.filter((u: any) => u.id !== id);
      await saveData("app_data", DATA_FILE, appData);
      io.emit("unit_tab_deleted", id);
    });

    socket.on("signup_user", async (newUser: any) => {
      console.log(`Signup attempt for user: ${newUser.username}`);
      if (!usersData.some((u: any) => u.username.toUpperCase() === newUser.username.toUpperCase())) {
        usersData.push(newUser);
        await saveData("users_data", USERS_FILE, usersData);
        io.emit("user_signed_up", newUser);
        console.log(`User ${newUser.username} signed up successfully`);
      } else {
        console.warn(`Signup failed: User ${newUser.username} already exists`);
      }
    });

    socket.on("update_user_profile", async (data: { username: string, updates: any }) => {
      if (!isAuth()) return;
      usersData = usersData.map((u: any) => 
        u.username.toUpperCase() === data.username.toUpperCase() ? { ...u, ...data.updates } : u
      );
      await saveData("users_data", USERS_FILE, usersData);
      io.emit("user_profile_updated", data);
    });

    socket.on("update_all_users", async (newUsers: any) => {
      if (!isAuth() || authenticatedUser.role !== 'ADMINISTRADOR') return;
      usersData = newUsers;
      await saveData("users_data", USERS_FILE, usersData);
      io.emit("users_data_updated", usersData);
    });

    socket.on("update_user_notes", async (data: { username: string, notes: any[] }) => {
      if (!isAuth()) return;
      notesData[data.username.toUpperCase()] = data.notes;
      await saveData("notes_data", NOTES_FILE, notesData);
      io.emit("notes_updated", data);
    });

    socket.on("add_review", async (review: any) => {
      if (!isAuth()) return;
      reviewsData.push(review);
      await saveData("reviews_data", REVIEWS_FILE, reviewsData);
      io.emit("review_added", review);
    });

    socket.on("send_message", async (data: any) => {
      if (!isAuth()) return;
      appData.messages.push(data);
      await saveData("app_data", DATA_FILE, appData);

      if (data.channel === 'global') {
        io.emit("receive_message", data);
      } else if (data.channel === 'unit') {
        io.to(data.authorUnit).emit("receive_message", data);
      } else if (data.channel === 'private' && data.recipient) {
        io.emit("receive_message", data);
      }
    });

    socket.on("send_notification", async (data: any) => {
      if (!isAuth()) return;
      appData.notifications.unshift(data);
      await saveData("app_data", DATA_FILE, appData);
      io.to(data.unit).emit("receive_notification", data);
    });

    socket.on("send_announcement", async (data: any) => {
      if (!isAuth()) return;
      appData.announcements.unshift(data);
      await saveData("app_data", DATA_FILE, appData);
      io.emit("receive_announcement", data);
    });

    socket.on("send_recado", async (data: any) => {
      if (!isAuth()) return;
      appData.recados.unshift(data);
      await saveData("app_data", DATA_FILE, appData);
      io.to(data.toUnit).emit("receive_recado", data);
      io.to(data.fromUnit).emit("receive_recado", data);
    });

    socket.on("send_recado_response", async (data: any) => {
      if (!isAuth()) return;
      appData.recados = appData.recados.map((r: any) => r.id === data.recadoId ? {
        ...r,
        status: 'responded',
        response: data.response,
        respondedBy: data.respondedBy,
        respondedAt: data.respondedAt
      } : r);
      await saveData("app_data", DATA_FILE, appData);
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
