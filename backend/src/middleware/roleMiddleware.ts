import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js"; // or types.ts

export const requireBusiness = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.userType !== "business") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};
