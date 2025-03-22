import { Request, Response, NextFunction } from "express";
import { AuthService } from "@auth/service/service";
import { abort } from "@src/output";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const tokenParts = authHeader.split(" ");

      if (tokenParts.length === 2 && tokenParts[0] === "Bearer") {
        token = tokenParts[1];
      }
    }
  }

  if (!token) {
    return abort(res, 401, "Authentication required");
  }

  const authService = new AuthService();

  try {
    const decoded = authService.verifyAccessToken(token);

    (req as any).user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return abort(res, 401, "Invalid or expired token");
  }
};
