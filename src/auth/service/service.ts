import { AuthDAO } from "@auth/dao/dao";
import {
  LoginRequestDTO,
  RefreshTokenRequestDTO,
  TokenPayloadDTO,
} from "@auth/dto/dto";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuid4 } from "uuid";

export class AuthService {
  dao: AuthDAO;
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor() {
    this.dao = new AuthDAO();
    this.accessTokenSecret =
      process.env.JWT_ACCESS_SECRET || "access_secret_key";
    this.refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET || "refresh_secret_key";
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || "15m";
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || "7d";
  }

  async login(inputData: LoginRequestDTO) {
    const user = await this.dao.getUserByUsername(inputData.username);

    if (!user) {
      throw new Error("Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(
      inputData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    const payload: TokenPayloadDTO = {
      userId: user.userId,
      username: user.username,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Store refresh token in database
    await this.dao.saveRefreshToken(user.userId, refreshToken);

    return {
      ...user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(inputData: RefreshTokenRequestDTO) {
    try {
      // Verify refresh token
      const payload = jwt.verify(
        inputData.refreshToken,
        this.refreshTokenSecret
      ) as TokenPayloadDTO;

      // Check if refresh token exists in database
      const storedToken = await this.dao.getRefreshToken(
        payload.userId,
        inputData.refreshToken
      );

      if (!storedToken) {
        throw new Error("Invalid refresh token");
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken({
        userId: payload.userId,
        username: payload.username,
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: payload.userId,
        username: payload.username,
      });

      // Replace old refresh token with new one
      await this.dao.replaceRefreshToken(
        payload.userId,
        inputData.refreshToken,
        newRefreshToken
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  generateAccessToken(payload: TokenPayloadDTO): string {
    return jwt.sign(payload as object, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    } as jwt.SignOptions) as string;
  }

  generateRefreshToken(payload: TokenPayloadDTO): string {
    return jwt.sign(payload as object, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
    } as jwt.SignOptions) as string;
  }

  verifyAccessToken(token: string): TokenPayloadDTO {
    return jwt.verify(token, this.accessTokenSecret) as TokenPayloadDTO;
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.dao.deleteRefreshToken(userId, refreshToken);
  }
}
