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
        .populate("senderId", "username email");
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
export const getHealth = (_req, res) => {
    res.json({ ok: true });
};
export const getUsers = async (_req, res) => {
    const users = await User.find().sort({ username: 1 });
    res.json(users.map(serializeUser));
};
export const createUser = async (req, res) => {
    const username = String(req.body.username ?? "").trim();
    const emailValue = String(req.body.email ?? "").trim();
    if (!username) {
        return res.status(400).json({ message: "Username is required." });
    }
    const existingUser = await User.findOne({
        username: { $regex: `^${username}$`, $options: "i" },
    });
    if (existingUser) {
        return res.status(409).json({ message: "Username already exists." });
    }
    const userPayload = { username };
    if (emailValue) {
        userPayload.email = emailValue;
    }
    const user = await User.create(userPayload);
    return res.status(201).json(serializeUser(user));
};
export const getChats = async (req, res) => {
    const userId = String(req.userId ?? "").trim();
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: "A valid userId is required." });
    }
    const chats = await Chat.find({ members: userId })
        .populate("members", "username email role")
        .populate("admins", "username email role")
        .sort({ updatedAt: -1 });
    const serializedChats = await Promise.all(chats.map((chat) => serializeChat(chat)));
    return res.json(serializedChats);
};
export const createDirectChat = async (req, res) => {
    const currentUserId = String(req.userId ?? "").trim();
    const recipientId = String(req.body.recipientId ?? "").trim();
    const memberIds = [currentUserId, recipientId];
    if (memberIds.some((memberId) => !mongoose.isValidObjectId(memberId))) {
        return res.status(400).json({ message: "Please provide a valid recipient." });
    }
    const existingChat = await Chat.findOne({
        isGroup: false,
        members: { $all: memberIds },
        $expr: { $eq: [{ $size: "$members" }, memberIds.length] },
    })
        .populate("members", "username email role")
        .populate("admins", "username email role");
    if (existingChat) {
        return res.json(await serializeChat(existingChat));
    }
    const chatPayload = {
        isGroup: false,
        members: memberIds,
        admins: [currentUserId],
    };
    const chat = await Chat.create(chatPayload);
    const populatedChat = await Chat.findById(chat._id)
        .populate("members", "username email role")
        .populate("admins", "username email role");
    if (!populatedChat) {
        return res.status(404).json({ message: "Chat could not be created." });
    }
    return res.status(201).json(await serializeChat(populatedChat));
};
export const createGroupChat = async (req, res) => {
    const title = String(req.body.title ?? "").trim();
    const currentUserId = String(req.userId ?? "").trim();
    const adminIds = Array.isArray(req.body.adminIds)
        ? [
            ...new Set(req.body.adminIds
                .map((memberId) => String(memberId).trim())
                .filter(Boolean)),
        ]
        : [];
    const memberIds = Array.isArray(req.body.memberIds)
        ? [
            ...new Set(req.body.memberIds
                .map((memberId) => String(memberId).trim())
                .filter(Boolean)),
        ]
        : [];
    if (mongoose.isValidObjectId(currentUserId) && !memberIds.includes(currentUserId)) {
        memberIds.unshift(currentUserId);
    }
    if (mongoose.isValidObjectId(currentUserId) && !adminIds.includes(currentUserId)) {
        adminIds.unshift(currentUserId);
    }
    if (!title) {
        return res.status(400).json({ message: "Group title is required." });
    }
    if (memberIds.length < 3 || memberIds.some((memberId) => !mongoose.isValidObjectId(memberId))) {
        return res.status(400).json({ message: "A group needs at least three valid members." });
    }
    if (adminIds.some((adminId) => !mongoose.isValidObjectId(adminId)) ||
        adminIds.some((adminId) => !memberIds.includes(adminId))) {
        return res.status(400).json({ message: "Admins must be valid group members." });
    }
    const chat = await Chat.create({
        title,
        isGroup: true,
        members: memberIds,
        admins: adminIds,
    });
    const populatedChat = await Chat.findById(chat._id)
        .populate("members", "username email role")
        .populate("admins", "username email role");
    if (!populatedChat) {
        return res.status(404).json({ message: "Group could not be created." });
    }
    return res.status(201).json(await serializeChat(populatedChat));
};
export const updateGroupChat = async (req, res) => {
    const chatId = String(req.params.chatId ?? "").trim();
    const currentUserId = String(req.userId ?? "").trim();
    const title = typeof req.body.title === "string" ? req.body.title.trim() : undefined;
    const addMemberIds = Array.isArray(req.body.addMemberIds)
        ? [...new Set(req.body.addMemberIds.map((id) => String(id).trim()).filter(Boolean))]
        : [];
    const removeMemberIds = Array.isArray(req.body.removeMemberIds)
        ? [...new Set(req.body.removeMemberIds.map((id) => String(id).trim()).filter(Boolean))]
        : [];
    const promoteAdminIds = Array.isArray(req.body.promoteAdminIds)
        ? [...new Set(req.body.promoteAdminIds.map((id) => String(id).trim()).filter(Boolean))]
        : [];
    const demoteAdminIds = Array.isArray(req.body.demoteAdminIds)
        ? [...new Set(req.body.demoteAdminIds.map((id) => String(id).trim()).filter(Boolean))]
        : [];
    if (!mongoose.isValidObjectId(chatId)) {
        return res.status(400).json({ message: "A valid chatId is required." });
    }
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
        return res.status(404).json({ message: "Group not found." });
    }
    const memberIds = new Set(chat.members.map((member) => String(member)));
    const adminIds = new Set((chat.admins ?? []).map((admin) => String(admin)));
    if (!adminIds.has(currentUserId)) {
        return res.status(403).json({ message: "Only group admins can update the group." });
    }
    if (title !== undefined && title) {
        chat.title = title;
    }
    for (const memberId of addMemberIds) {
        if (!mongoose.isValidObjectId(memberId)) {
            return res.status(400).json({ message: "Invalid member in addMemberIds." });
        }
        memberIds.add(memberId);
    }
    for (const memberId of removeMemberIds) {
        if (memberId === currentUserId && adminIds.size === 1) {
            return res.status(400).json({ message: "The last admin cannot remove themselves." });
        }
        memberIds.delete(memberId);
        adminIds.delete(memberId);
    }
    for (const adminId of promoteAdminIds) {
        if (!memberIds.has(adminId)) {
            return res.status(400).json({ message: "Admins must be group members." });
        }
        adminIds.add(adminId);
    }
    for (const adminId of demoteAdminIds) {
        if (adminId === currentUserId && adminIds.size === 1) {
            return res.status(400).json({ message: "The last admin cannot demote themselves." });
        }
        adminIds.delete(adminId);
    }
    if (memberIds.size < 3) {
        return res.status(400).json({ message: "A group must have at least three members." });
    }
    if (adminIds.size === 0) {
        return res.status(400).json({ message: "A group must have at least one admin." });
    }
    chat.members = [...memberIds];
    chat.admins = [...adminIds];
    await chat.save();
    const populatedChat = await Chat.findById(chat._id)
        .populate("members", "username email role")
        .populate("admins", "username email role");
    if (!populatedChat) {
        return res.status(404).json({ message: "Group not found after update." });
    }
    return res.json(await serializeChat(populatedChat));
};
export const getMessages = async (req, res) => {
    const chatId = String(req.params.chatId ?? "").trim();
    if (!mongoose.isValidObjectId(chatId)) {
        return res.status(400).json({ message: "A valid chatId is required." });
    }
    const messages = await Message.find({ chatId })
        .populate("senderId", "username email")
        .sort({ createdAt: 1 });
    return res.json(messages.map((message) => serializeMessage(message)));
};
//# sourceMappingURL=chat.controller.js.map