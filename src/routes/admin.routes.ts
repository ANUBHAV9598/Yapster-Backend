import { Router } from "express";
import {
  createAdminChat,
  createAdminMessage,
  createAdminUser,
  deleteAdminChat,
  deleteAdminMessage,
  deleteAdminUser,
  getAdminChats,
  getAdminDashboard,
  getAdminMessages,
  getAdminUsers,
  updateAdminChat,
  updateAdminMessage,
  updateAdminUser,
} from "../controllers/admin.controller.js";
import { adminPage } from "../controllers/auth.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use("/admin", requireAuth, requireAdmin);

router.get("/admin/page", adminPage);
router.get("/admin/dashboard", getAdminDashboard);

router.get("/admin/users", getAdminUsers);
router.post("/admin/users", createAdminUser);
router.patch("/admin/users/:userId", updateAdminUser);
router.delete("/admin/users/:userId", deleteAdminUser);

router.get("/admin/chats", getAdminChats);
router.post("/admin/chats", createAdminChat);
router.patch("/admin/chats/:chatId", updateAdminChat);
router.delete("/admin/chats/:chatId", deleteAdminChat);

router.get("/admin/messages", getAdminMessages);
router.post("/admin/messages", createAdminMessage);
router.patch("/admin/messages/:messageId", updateAdminMessage);
router.delete("/admin/messages/:messageId", deleteAdminMessage);

export default router;
