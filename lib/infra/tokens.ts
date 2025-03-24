import { Express } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

export interface TokenPayloadDTO {
  userId: string;
  email: string;
  [key: string]: any;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface TokensConfig {
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  EMAIL_VERIFICATION_SECRET: string;
}

class Tokens {
  private static config: TokensConfig = {
    JWT_ACCESS_SECRET: "access_secret_key",
    JWT_REFRESH_SECRET: "refresh_secret_key",
    JWT_ACCESS_EXPIRY: "15m",
    JWT_REFRESH_EXPIRY: "7d",
    EMAIL_VERIFICATION_SECRET: "email_verification_secret_key",
  };

  private static initialized = false;

  public static initApp(app: Express): void {
    const {
      JWT_ACCESS_SECRET,
      JWT_REFRESH_SECRET,
      JWT_ACCESS_EXPIRY,
      JWT_REFRESH_EXPIRY,
      EMAIL_VERIFICATION_SECRET,
    } = app.get("config");

    Tokens.config.JWT_ACCESS_SECRET =
      JWT_ACCESS_SECRET || Tokens.config.JWT_ACCESS_SECRET;
    Tokens.config.JWT_REFRESH_SECRET =
      JWT_REFRESH_SECRET || Tokens.config.JWT_REFRESH_SECRET;
    Tokens.config.JWT_ACCESS_EXPIRY =
      JWT_ACCESS_EXPIRY || Tokens.config.JWT_ACCESS_EXPIRY;
    Tokens.config.JWT_REFRESH_EXPIRY =
      JWT_REFRESH_EXPIRY || Tokens.config.JWT_REFRESH_EXPIRY;
    Tokens.config.EMAIL_VERIFICATION_SECRET =
      EMAIL_VERIFICATION_SECRET || Tokens.config.EMAIL_VERIFICATION_SECRET;

    Tokens.initialized = true;
  }

  constructor() {
    if (!Tokens.initialized) {
      console.warn(
        "Tokens not initialized with app config. Using default values."
      );
    }
  }

  public generateAccessToken(payload: TokenPayloadDTO): string {
    return jwt.sign(payload as object, Tokens.config.JWT_ACCESS_SECRET, {
      expiresIn: Tokens.config.JWT_ACCESS_EXPIRY,
    } as SignOptions) as string;
  }

  public generateRefreshToken(payload: TokenPayloadDTO): string {
    return jwt.sign(payload as object, Tokens.config.JWT_REFRESH_SECRET, {
      expiresIn: Tokens.config.JWT_REFRESH_EXPIRY,
    } as SignOptions) as string;
  }

  public generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  public verifyAccessToken(token: string): TokenPayloadDTO {
    try {
      return jwt.verify(
        token,
        Tokens.config.JWT_ACCESS_SECRET
      ) as TokenPayloadDTO;
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  public verifyRefreshToken(token: string): TokenPayloadDTO {
    try {
      return jwt.verify(
        token,
        Tokens.config.JWT_REFRESH_SECRET
      ) as TokenPayloadDTO;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  public verifyEmailVerificationToken(token: string): TokenPayloadDTO {
    try {
      return jwt.verify(
        token,
        Tokens.config.EMAIL_VERIFICATION_SECRET
      ) as TokenPayloadDTO;
    } catch (error) {
      throw new Error("Invalid email verification token");
    }
  }

  public generateAuthTokens(payload: TokenPayloadDTO): TokenResponse {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  public parseBasicToken(basicToken: string): {
    email: string;
    password: string;
  } {
    try {
      const decoded = Buffer.from(basicToken, "base64").toString("utf8");
      const [email, password] = decoded.split(":");
      if (!email || !password) {
        throw new Error("Invalid basic token format");
      }
      return { email, password };
    } catch (error) {
      throw new Error("Invalid basic token");
    }
  }
}

export default Tokens;
