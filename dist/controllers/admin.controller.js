import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Chat from "../models/privatemessage.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
const isPopulatedUser = (value) => typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    "username" in value;
const serializeUser = (user) => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email ?? null,
    role: user.role ?? "user",
});
const serializeMessage = (message) => ({
    id: message._id.toString(),
    chatId: message.chatId.toString(),
    sender: isPopulatedUser(message.senderId)
        ? serializeUser(message.senderId)
        : {
            id: String(message.senderId),
            username: "Unknown",
            email: null,
            role: "user",
        },
    text: message.text,
    status: message.status ?? "sent",
    readAt: message.readAt ?? null,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
});
const serializeChat = async (chat) => {
    const latestMessage = await Message.findOne({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .populate("senderId", "username role email");
    return {
        id: chat._id.toString(),
        title: chat.title ?? null,
        isGroup: chat.isGroup ?? false,
        members: chat.members.map((member) => isPopulatedUser(member)
            ? serializeUser(member)
            : {
                id: String(member),
                username: "Unknown",
                email: null,
                role: "user",
            }),
        admins: (chat.admins ?? []).map((admin) => isPopulatedUser(admin)
            ? serializeUser(admin)
            : {
                id: String(admin),
                username: "Unknown",
                email: null,
                role: "user",
            }),
        latestMessage: latestMessage ? serializeMessage(latestMessage) : null,
        updatedAt: chat.updatedAt,
    };
};
const normalizeIds = (value) => Array.isArray(value)
    ? [...new Set(value.map((item) => String(item).trim()).filter(Boolean))]
    : [];
export const getAdminDashboard = async (_req, res) => {
    const [userCount, chatCount, messageCount] = await Promise.all([
        User.countDocuments(),
        Chat.countDocuments(),
        Message.countDocuments(),
    ]);
    return res.json({
        stats: {
            users: userCount,
            chats: chatCount,
            messages: messageCount,
        },
    });
};
export const getAdminUsers = async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users.map(serializeUser));
};
export const createAdminUser = async (req, res) => {
    const username = String(req.body.username ?? "").trim();
    const password = String(req.body.password ?? "");
    const role = req.body.role === "admin" ? "admin" : "user";
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    const existingUser = await User.findOne({
        username: { $regex: `^${username}$`, $options: "i" },
    });
    if (existingUser) {
        return res.status(409).json({ message: "Username already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        role,
        password: hashedPassword,
    });
    return res.status(201).json(serializeUser(user));
};
export const updateAdminUser = async (req, res) => {
    const userId = String(req.params.userId ?? "").trim();
    const username = typeof req.body.username === "string" ? req.body.username.trim() : undefined;
    const password = typeof req.body.password === "string" ? req.body.password : undefined;
    const role = req.body.role === "admin" ? "admin" : req.body.role === "user" ? "user" : undefined;
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: "A valid userId is required." });
    }
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }
    if (username && username !== user.username) {
        const existingUser = await User.findOne({
            _id: { $ne: user._id },
            username: { $regex: `^${username}$`, $options: "i" },
        });
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists." });
        }
        user.username = username;
    }
    if (role) {
        user.role = role;
    }
    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    return res.json(serializeUser(user));
};
export const deleteAdminUser = async (req, res) => {
    const userId = String(req.params.userId ?? "").trim();
    const currentUserId = String(req.userId ?? "").trim();
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: "A valid userId is required." });
    }
    if (userId === currentUserId) {
        return res.status(400).json({ message: "Admins cannot delete their own account." });
    }
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }
    await Message.deleteMany({ senderId: user._id });
    const affectedChats = await Chat.find({ members: user._id });
    for (const chat of affectedChats) {
        chat.members = chat.members.filter((member) => String(member) !== userId);
        chat.admins = (chat.admins ?? []).filter((admin) => String(admin) !== userId);
        if (chat.members.length < 2) {
            await Message.deleteMany({ chatId: chat._id });
            await Chat.findByIdAndDelete(chat._id);
            continue;
        }
        if (chat.isGroup && (!chat.admins || chat.admins.length === 0)) {
            chat.admins = [chat.members[0]];
        }
        await chat.save();
    }
    await User.findByIdAndDelete(user._id);
    return res.json({ message: "User deleted." });
};
export const getAdminChats = async (_req, res) => {
    const chats = await Chat.find()
        .populate("members", "username email role")
        .populate("admins", "username email role")
        .sort({ updatedAt: -1 });
    const serializedChats = await Promise.all(chats.map((chat) => serializeChat(chat)));
    return res.json(serializedChats);
};
export const createAdminChat = async (req, res) => {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const isGroup = Boolean(req.body.isGroup);
    const memberIds = normalizeIds(req.body.memberIds);
    const adminIds = normalizeIds(req.body.adminIds);
    if (memberIds.length < (isGroup ? 2 : 2)) {
        return res.status(400).json({ message: "Please provide enough members." });
    }
    if (memberIds.some((memberId) => !mongoose.isValidObjectId(memberId))) {
        return res.status(400).json({ message: "Invalid memberIds provided." });
    }
    if (adminIds.some((adminId) => !mongoose.isValidObjectId(adminId))) {
        return res.status(400).json({ message: "Invalid adminIds provided." });
    }
    const finalAdminIds = isGroup
        ? adminIds.filter((adminId) => memberIds.includes(adminId))
        : adminIds.filter((adminId) => memberIds.includes(adminId)).slice(0, 1);
    const chat = await Chat.create({
        title: isGroup ? title : undefined,
        isGroup,
        members: memberIds,
        admins: finalAdminIds,
    });
    const populatedChat = await Chat.findById(chat._id)
        .populate("members", "username email role")
        .populate("admins", "username email role");
    if (!populatedChat) {
        return res.status(404).json({ message: "Chat not found after creation." });
    }
    return res.status(201).json(await serializeChat(populatedChat));
};
export const updateAdminChat = async (req, res) => {
    const chatId = String(req.params.chatId ?? "").trim();
    const title = typeof req.body.title === "string" ? req.body.title.trim() : undefined;
    const memberIds = normalizeIds(req.body.memberIds);
    const adminIds = normalizeIds(req.body.adminIds);
    const isGroup = typeof req.body.isGroup === "boolean" ? req.body.isGroup : undefined;
    if (!mongoose.isValidObjectId(chatId)) {
        return res.status(400).json({ message: "A valid chatId is required." });
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat not found." });
    }
    if (title !== undefined) {
        chat.title = title;
    }
    if (isGroup !== undefined) {
        chat.isGroup = isGroup;
    }
    if (memberIds.length > 0) {
        if (memberIds.some((memberId) => !mongoose.isValidObjectId(memberId))) {
            return res.status(400).json({ message: "Invalid memberIds provided." });
        }
        if (memberIds.length < 2) {
            return res.status(400).json({ message: "A chat needs at least two members." });
        }
        chat.members = memberIds;
    }
    if (adminIds.length > 0 || chat.isGroup) {
        if (adminIds.some((adminId) => !mongoose.isValidObjectId(adminId))) {
            return res.status(400).json({ message: "Invalid adminIds provided." });
        }
        const validAdminIds = adminIds.filter((adminId) => (memberIds.length > 0 ? memberIds : chat.members.map((member) => String(member))).includes(adminId));
        chat.admins = validAdminIds;
    }
    await chat.save();
    const populatedChat = await Chat.findById(chat._id)
        .populate("members", "username email role")
        .populate("admins", "username email role");
    if (!populatedChat) {
        return res.status(404).json({ message: "Chat not found after update." });
    }
    return res.json(await serializeChat(populatedChat));
};
export const deleteAdminChat = async (req, res) => {
    const chatId = String(req.params.chatId ?? "").trim();
    if (!mongoose.isValidObjectId(chatId)) {
        return res.status(400).json({ message: "A valid chatId is required." });
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat not found." });
    }
    await Message.deleteMany({ chatId: chat._id });
    await Chat.findByIdAndDelete(chat._id);
    return res.json({ message: "Chat deleted." });
};
export const getAdminMessages = async (_req, res) => {
    const messages = await Message.find()
        .populate("senderId", "username email role")
        .sort({ createdAt: -1 })
        .limit(200);
    return res.json(messages.map((message) => serializeMessage(message)));
};
export const createAdminMessage = async (req, res) => {
    const chatId = String(req.body.chatId ?? "").trim();
    const senderId = String(req.body.senderId ?? "").trim();
    const text = String(req.body.text ?? "").trim();
    if (!mongoose.isValidObjectId(chatId) || !mongoose.isValidObjectId(senderId) || !text) {
        return res.status(400).json({ message: "chatId, senderId, and text are required." });
    }
    const message = await Message.create({
        chatId,
        senderId,
        text,
    });
    await Chat.findByIdAndUpdate(chatId, { $set: { updatedAt: new Date() } });
    const populatedMessage = await Message.findById(message._id).populate("senderId", "username email role");
    if (!populatedMessage) {
        return res.status(404).json({ message: "Message not found after creation." });
    }
    return res.status(201).json(serializeMessage(populatedMessage));
};
export const updateAdminMessage = async (req, res) => {
    const messageId = String(req.params.messageId ?? "").trim();
    const text = String(req.body.text ?? "").trim();
    if (!mongoose.isValidObjectId(messageId) || !text) {
        return res.status(400).json({ message: "A valid messageId and text are required." });
    }
    const message = await Message.findById(messageId);
    if (!message) {
        return res.status(404).json({ message: "Message not found." });
    }
    message.text = text;
    await message.save();
    const populatedMessage = await Message.findById(message._id).populate("senderId", "username email role");
    if (!populatedMessage) {
        return res.status(404).json({ message: "Message not found after update." });
    }
    return res.json(serializeMessage(populatedMessage));
};
export const deleteAdminMessage = async (req, res) => {
    const messageId = String(req.params.messageId ?? "").trim();
    if (!mongoose.isValidObjectId(messageId)) {
        return res.status(400).json({ message: "A valid messageId is required." });
    }
    const message = await Message.findById(messageId);
    if (!message) {
        return res.status(404).json({ message: "Message not found." });
    }
    await Message.findByIdAndDelete(message._id);
    return res.json({ message: "Message deleted." });
};
//# sourceMappingURL=admin.controller.js.map