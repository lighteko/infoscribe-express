import { Request, Response, NextFunction } from "express";
import { abort } from "@src/output";
import Tokens from "@lib/infra/tokens";

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

  try {
    const tokens = Tokens.getInstance();
    const decoded = tokens.verifyAccessToken(token);

    (req as any).user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return abort(res, 401, "Invalid or expired token");
  }
};
