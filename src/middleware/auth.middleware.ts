import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "chat-app-secret";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId?: string };

    if (!payload.userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized." });
  }
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const user = await User.findById(req.userId).select("role");

  if (!user) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  if ((user.role ?? "user") !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  next();
};
