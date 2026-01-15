import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    username?: string;
    userType?: string;
  };
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET!;
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in .env");

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || !decoded._id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    (req as AuthRequest).user = {
      _id: new Types.ObjectId(decoded._id),
      username: decoded.username,
      userType: decoded.userType,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
