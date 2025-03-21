import { Request, Response, NextFunction } from "express";
import { AuthService } from "@auth/service/service";
import { abort } from "@src/output";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return abort(res, 401, "Authentication required");
  }
  
  const tokenParts = authHeader.split(" ");
  
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return abort(res, 401, "Invalid token format");
  }
  
  const token = tokenParts[1];
  const authService = new AuthService();
  
  try {
    const decoded = authService.verifyAccessToken(token);
    
    // Add user to request
    (req as any).user = {
      userId: decoded.userId,
      username: decoded.username,
    };
    
    next();
  } catch (error) {
    return abort(res, 401, "Invalid or expired token");
  }
};
