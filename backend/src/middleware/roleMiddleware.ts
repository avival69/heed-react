import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User.js";

interface AuthRequest extends Request {
  user?: IUser;
}

export const requireBusiness = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.userType !== "business") return res.status(403).json({ message: "Access denied" });
  next();
};
