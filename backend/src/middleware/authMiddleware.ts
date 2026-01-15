import { Request, Response, NextFunction } from "express";
//Express types for middleware fucntions
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

//extends request object to include user property
export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;//_id is of type ObjectId from mongoose
    username?: string;//optional username
    userType?: string;//optional userType
  };
}
//we do this cause after authentication we want to
//  attach user info to the request object


//This is an Express middleware

//req → incoming HTTP request

//res → outgoing response

//next → function to move to the next middleware/controller
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
