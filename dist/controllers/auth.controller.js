import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
const JWT_SECRET = process.env.JWT_SECRET ?? "chat-app-secret";
const serializeUser = (user) => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email ?? null,
    role: user.role ?? "user",
});
const createToken = (userId) => jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
});
export const signup = async (req, res) => {
    const username = String(req.body.username ?? "").trim();
    const password = String(req.body.password ?? "");
    const role = "user";
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    if (password.length < 6) {
        return res
            .status(400)
            .json({ message: "Password must be at least 6 characters long." });
    }
    const existingUser = await User.findOne({
        username: { $regex: `^${username}$`, $options: "i" },
    });
    if (existingUser) {
        return res.status(409).json({ message: "A user with that username already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        role,
        password: hashedPassword,
    });
    return res.status(201).json({
        token: createToken(user._id.toString()),
        user: serializeUser(user),
    });
};
export const login = async (req, res) => {
    const username = String(req.body.username ?? "").trim();
    const password = String(req.body.password ?? "");
    const role = req.body.role === "admin" ? "admin" : "user";
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    const user = await User.findOne({
        username: { $regex: `^${username}$`, $options: "i" },
    });
    if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid username or password." });
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid username or password." });
    }
    if ((user.role ?? "user") !== role) {
        return res.status(403).json({ message: `This account is not registered as ${role}.` });
    }
    return res.json({
        token: createToken(user._id.toString()),
        user: serializeUser(user),
    });
};
export const ensureAdminAccount = async () => {
    const hashedPassword = await bcrypt.hash("admin", 10);
    await User.findOneAndUpdate({ username: "admin" }, {
        $set: {
            username: "admin",
            role: "admin",
            password: hashedPassword,
        },
        $unset: {
            email: 1,
        },
    }, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
    });
};
export const me = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized." });
    }
    const user = await User.findById(userId).select("username role");
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }
    return res.json({ user: serializeUser(user) });
};
export const changePassword = async (req, res) => {
    const userId = req.userId;
    const newPassword = String(req.body.newPassword ?? "");
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized." });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }
    const user = await User.findById(userId).select("password");
    if (!user?.password) {
        return res.status(404).json({ message: "User not found." });
    }
    const nextPasswordHash = await bcrypt.hash(newPassword, 10);
    user.password = nextPasswordHash;
    await user.save();
    return res.json({ message: "Password updated successfully." });
};
export const adminPage = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized." });
    }
    const user = await User.findById(userId).select("username role");
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }
    return res.json({
        message: "Welcome to the admin page.",
        user: serializeUser(user),
    });
};
//# sourceMappingURL=auth.controller.js.map