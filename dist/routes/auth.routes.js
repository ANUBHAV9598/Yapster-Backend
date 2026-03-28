import { Router } from "express";
import { changePassword, login, me, signup } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, me);
router.patch("/auth/change-password", requireAuth, changePassword);
export default router;
//# sourceMappingURL=auth.routes.js.map