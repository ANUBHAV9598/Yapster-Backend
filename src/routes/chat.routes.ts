import { Router } from "express";
import {
  createDirectChat,
  createGroupChat,
  getChats,
  getHealth,
  getMessages,
  getUsers,
  updateGroupChat,
} from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/health", getHealth);
router.get("/users", requireAuth, getUsers);
router.get("/chats", requireAuth, getChats);
router.post("/chats/direct", requireAuth, createDirectChat);
router.post("/chats/group", requireAuth, createGroupChat);
router.patch("/chats/:chatId/group", requireAuth, updateGroupChat);
router.get("/messages/:chatId", requireAuth, getMessages);

export default router;
