import { AuthService } from "@auth/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { LoginResponseDTO, RefreshTokenResponseDTO } from "@auth/dto/dto";

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

      const response = await this.service.login(basicToken.split(" ")[1]);
      send(res, 200, response, LoginResponseDTO);
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
      send(res, 200, response, RefreshTokenResponseDTO);
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
      send(res, 200, { message: "Logged out successfully" });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}
