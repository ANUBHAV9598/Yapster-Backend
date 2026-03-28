import mongoose from "mongoose";
import Chat from "../models/privatemessage.model.js";
import Message from "../models/message.model.js";
const isPopulatedUser = (value) => typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    "username" in value;
export const chatSocket = (io) => {
    const socketUsers = new Map();
    const onlineUsers = new Map();
    const emitOnlineUsers = () => {
        io.emit("online_users", Array.from(onlineUsers.keys()));
    };
    const markUserOffline = (socketId) => {
        const userId = socketUsers.get(socketId);
        if (!userId) {
            return;
        }
        socketUsers.delete(socketId);
        const currentCount = onlineUsers.get(userId) ?? 0;
        if (currentCount <= 1) {
            onlineUsers.delete(userId);
            io.emit("user_status", { userId, status: "offline" });
        }
        else {
            onlineUsers.set(userId, currentCount - 1);
        }
        emitOnlineUsers();
    };
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        socket.on("register_user", ({ userId }) => {
            const normalizedUserId = String(userId ?? "").trim();
            if (!mongoose.isValidObjectId(normalizedUserId)) {
                return;
            }
            socketUsers.set(socket.id, normalizedUserId);
            const currentCount = onlineUsers.get(normalizedUserId) ?? 0;
            onlineUsers.set(normalizedUserId, currentCount + 1);
            if (currentCount === 0) {
                io.emit("user_status", { userId: normalizedUserId, status: "online" });
            }
            emitOnlineUsers();
        });
        socket.on("unregister_user", ({ userId }) => {
            const normalizedUserId = String(userId ?? "").trim();
            if (!normalizedUserId) {
                return;
            }
            const matchedSocketIds = Array.from(socketUsers.entries())
                .filter(([, currentUserId]) => currentUserId === normalizedUserId)
                .map(([socketId]) => socketId);
            if (matchedSocketIds.length === 0) {
                return;
            }
            matchedSocketIds.forEach((socketId) => {
                markUserOffline(socketId);
            });
        });
        socket.on("join_chat", ({ chatId }) => {
            if (chatId) {
                socket.join(chatId);
            }
        });
        socket.on("leave_chat", ({ chatId }) => {
            if (chatId) {
                socket.leave(chatId);
            }
        });
        socket.on("typing", (payload) => {
            if (!payload?.chatId || !payload?.username) {
                return;
            }
            socket.to(payload.chatId).emit("typing", payload);
        });
        socket.on("send_message", async (payload) => {
            const chatId = String(payload?.chatId ?? "").trim();
            const senderId = String(payload?.senderId ?? "").trim();
            const text = String(payload?.text ?? "").trim();
            if (!text ||
                !mongoose.isValidObjectId(chatId) ||
                !mongoose.isValidObjectId(senderId)) {
                return;
            }
            const chat = await Chat.findById(chatId).select("members");
            if (!chat) {
                return;
            }
            const otherMemberIds = chat.members
                .map((member) => String(member))
                .filter((memberId) => memberId !== senderId);
            const isDelivered = otherMemberIds.some((memberId) => onlineUsers.has(memberId));
            const message = await Message.create({
                chatId,
                senderId,
                text,
                status: isDelivered ? "delivered" : "sent",
            });
            const populatedMessage = await Message.findById(message._id).populate("senderId", "username email role");
            if (!populatedMessage) {
                return;
            }
            const sender = isPopulatedUser(populatedMessage.senderId)
                ? {
                    id: populatedMessage.senderId._id.toString(),
                    username: populatedMessage.senderId.username,
                    email: populatedMessage.senderId.email ?? null,
                    role: populatedMessage.senderId.role ?? "user",
                }
                : {
                    id: senderId,
                    username: "Unknown",
                    email: null,
                    role: "user",
                };
            io.to(chatId).emit("receive_message", {
                id: populatedMessage._id.toString(),
                chatId: populatedMessage.chatId.toString(),
                sender,
                text: populatedMessage.text,
                status: populatedMessage.status,
                readAt: populatedMessage.readAt ?? null,
                createdAt: populatedMessage.createdAt,
                updatedAt: populatedMessage.updatedAt,
            });
        });
        socket.on("mark_messages_read", async (payload) => {
            const chatId = String(payload?.chatId ?? "").trim();
            const userId = String(payload?.userId ?? "").trim();
            if (!mongoose.isValidObjectId(chatId) || !mongoose.isValidObjectId(userId)) {
                return;
            }
            const unreadMessages = await Message.find({
                chatId,
                senderId: { $ne: userId },
                status: { $ne: "read" },
            }).select("_id");
            if (unreadMessages.length === 0) {
                return;
            }
            const messageIds = unreadMessages.map((message) => message._id);
            await Message.updateMany({ _id: { $in: messageIds } }, {
                $set: {
                    status: "read",
                    readAt: new Date(),
                },
            });
            io.to(chatId).emit("messages_read", {
                chatId,
                readerId: userId,
                messageIds: messageIds.map((id) => id.toString()),
                status: "read",
                readAt: new Date().toISOString(),
            });
        });
        socket.on("disconnect", () => {
            markUserOffline(socket.id);
            console.log("User disconnected:", socket.id);
        });
    });
};
//# sourceMappingURL=chat.js.map