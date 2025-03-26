import { AuthService } from "@auth/service/service";
import { Request, Response } from "express";
import { abort, clearTokens, send, sendTokens } from "@src/output";
import { serialize } from "ts-data-object";
import {
  PasswordResetRequestDTO,
  PasswordResetValidationDTO,
  SignUpRequestDTO,
} from "@auth/dto/dto";

export class SignupController {
  service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(SignUpRequestDTO, req.body);
      await this.service.signup(serialized);
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

      sendTokens(
        res,
        { accessToken, refreshToken },
        { message: "Log in success" },
        null,
        req.body.isSessionOnly
      );
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
      sendTokens(res, response, { message: "Token reissued successfully" });
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
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        abort(res, 400, "Refresh token is required");
        return;
      }
      await this.service.logout(refreshToken);
      clearTokens(res);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class EmailVerificationController {
  service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const token = req.query.token as any as string;
      const response = await this.service.handleEmailVerification(token);
      sendTokens(
        res,
        response,
        { message: "Token reissued successfully" },
        "https://infoscribe.me/dashboard"
      );
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class PasswordResetController {
  service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  patch = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(PasswordResetRequestDTO, req.body);
      await this.service.resetPassword(serialized);
      send(res, 204, { message: "Reset password successfully" });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };

  post = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(PasswordResetValidationDTO, req.body);
      await this.service.sendPasswordResetEmail(serialized);
      send(res, 201, {
        message: "Dispatched password reset email successfully",
      });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}
