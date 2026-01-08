import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

interface AuthRequest extends Request {
  user?: IUser;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", err });
  }
};
