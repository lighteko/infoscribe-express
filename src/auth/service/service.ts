import { AuthDAO } from "@auth/dao/dao";
import { TokenPayloadDTO } from "@auth/dto/dto";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

  parseBasicToken(basicToken: string) {
    const decoded = Buffer.from(basicToken, "base64").toString("utf8");
    const [email, password] = decoded.split(":");
    return { email, password };
  }

  async login(basicToken: string) {
    const { email, password } = this.parseBasicToken(basicToken);
    const user = await this.dao.getUserByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const payload: TokenPayloadDTO = {
      userId: user.userId,
      email: user.email,
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

  async reissueToken(refreshToken: string) {
    try {
      const payload = jwt.verify(
        refreshToken,
        this.refreshTokenSecret
      ) as TokenPayloadDTO;

      const storedToken = await this.dao.getRefreshToken(
        payload.userId,
        refreshToken
      );

      if (!storedToken) {
        throw new Error("Invalid refresh token");
      }

      const newAccessToken = this.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: payload.userId,
        email: payload.email,
      });

      await this.dao.replaceRefreshToken(
        payload.userId,
        refreshToken,
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
