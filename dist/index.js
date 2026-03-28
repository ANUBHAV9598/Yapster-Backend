import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { ensureAdminAccount } from "./controllers/auth.controller.js";
import { connectDB } from "./db/db.js";
import { securityHeaders } from "./middleware/security.middleware.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { chatSocket } from "./sockets/chat.js";
dotenv.config();
const PORT = Number(process.env.PORT ?? 5000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const app = express();
app.disable("x-powered-by");
app.use(cors({
    origin: CLIENT_ORIGIN,
}));
app.use(securityHeaders(CLIENT_ORIGIN));
app.use(express.json());
const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: CLIENT_ORIGIN,
    },
});
chatSocket(io);
app.use(authRoutes);
app.use(chatRoutes);
app.use(adminRoutes);
app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
});
const startServer = async () => {
    try {
        await connectDB();
        await ensureAdminAccount();
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
void startServer();
//# sourceMappingURL=index.js.map