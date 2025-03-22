import { AuthService } from "@auth/service/service";
import { Request, Response } from "express";
import { abort, clearTokens, send, sendTokens } from "@src/output";

export class SignupController {
  service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, username } = req.body;
      await this.service.signup({
        email,
        password,
        firstName,
        lastName,
        username,
      });
      send(res, 201, { message: "User created successfully" });
    } catch (e: any) {
      abort(res, 400, String(e));
    }
  };
}

export class LoginController {
  service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const basicToken = req.headers.authorization;
      if (!basicToken || basicToken.split(" ")[0] !== "Basic") {
        abort(res, 401, "Authentication required");
        return;
      }

      const { accessToken, refreshToken } = await this.service.login(
        basicToken.split(" ")[1]
      );

      sendTokens(res, { accessToken, refreshToken });
    } catch (e: any) {
      abort(res, 401, String(e));
    }
  };
}

export class RefreshTokenController {
  service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken || refreshToken.split(" ")[0] !== "Bearer") {
        abort(res, 401, "Refresh token is required");
        return;
      }

      const response = await this.service.reissueToken(
        refreshToken.split(" ")[1]
      );
      sendTokens(res, response);
    } catch (e: any) {
      abort(res, 401, String(e));
    }
  };
}

export class LogoutController {
  service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const refreshToken = req.cookies.refreshToken;

      if (!userId || !refreshToken) {
        abort(res, 400, "User ID and refresh token are required");
        return;
      }
      await this.service.logout(userId, refreshToken);
      clearTokens(res);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}
