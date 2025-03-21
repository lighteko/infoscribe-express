import { AuthService } from "@auth/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import {
  LoginRequestDTO,
  LoginResponseDTO,
  RefreshTokenRequestDTO,
  RefreshTokenResponseDTO,
} from "@auth/dto/dto";
import { serialize } from "ts-data-object";

export class LoginController {
  service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(LoginRequestDTO, req.body);
      const response = await this.service.login(serialized);
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
      const serialized = await serialize(RefreshTokenRequestDTO, req.body);
      const response = await this.service.refreshToken(serialized);
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
      const refreshToken = req.body.refreshToken;
      
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