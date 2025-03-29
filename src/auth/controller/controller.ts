import { AuthService } from "@auth/service/service";
import { Request, Response } from "express";
import { abort, clearRefreshToken, send, sendTokens } from "@src/output";
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

      const { isValid, message } = this.service.validatePasswordStrength(
        serialized.password
      );

      if (!isValid) return abort(res, 400, message);

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
      if (!basicToken || basicToken.split(" ")[0] !== "Basic")
        return abort(res, 401, "Authentication required");

      const { accessToken, refreshToken, user } = await this.service.login(
        basicToken.split(" ")[1]
      );

      sendTokens(
        res,
        { accessToken, refreshToken },
        { message: "Log in success", user },
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
      sendTokens(
        res,
        response,
        { message: "Token reissued successfully" },
        req.body.isSessionOnly
      );
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
      if (!refreshToken || refreshToken.split(" ")[0] !== "Bearer")
        return abort(res, 401, "Refresh token is required");

      await this.service.logout(refreshToken.split(" ")[1]);
      clearRefreshToken(res);
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
      const token = req.body.token as string;
      const response = await this.service.handleEmailVerification(token);
      sendTokens(res, response, { message: "Email verified successfully" });
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

      const { isValid, message } = this.service.validatePasswordStrength(
        serialized.newPassword
      );

      if (!isValid) return abort(res, 400, message);

      await this.service.resetPassword(serialized);
      send(res, 200, { message: "Reset password successfully" });
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
