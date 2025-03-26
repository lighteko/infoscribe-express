import { AuthDAO } from "@auth/dao/dao";
import {
  EmailVerificationDTO,
  PasswordResetRequestDTO,
  PasswordResetValidationDTO,
  SignUpRequestDTO,
  TokenPayloadDTO,
  UpdateUserRequestDTO,
} from "@auth/dto/dto";
import bcrypt from "bcrypt";
import Tokens from "@lib/infra/tokens";
import SES from "@lib/infra/ses";
import { serialize } from "ts-data-object";

export class AuthService {
  dao: AuthDAO;
  tokens: Tokens;
  ses: SES;

  constructor() {
    this.dao = new AuthDAO();
    this.tokens = Tokens.getInstance();
    this.ses = SES.getInstance();
  }

  async signup(inputData: SignUpRequestDTO) {
    const user = await this.dao.getUserByEmail(inputData.email);
    if (user) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(inputData.password, 10);
    inputData.password = hashedPassword;
    const userId = await this.dao.createUser(inputData);
    const emailDTO: EmailVerificationDTO = {
      userId,
      username: inputData.username,
      email: inputData.email,
    };
    await this.sendEmailVerification(emailDTO);
  }

  async login(basicToken: string) {
    const { email, password } = this.tokens.parseBasicToken(basicToken);
    const user = await this.dao.getUserByEmail(email);

    if (!user) {
      throw new Error("No user found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.pwd);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const payload: TokenPayloadDTO = {
      userId: user.userId,
      email: user.email,
    };

    const accessToken = this.tokens.generateAccessToken(payload);
    const refreshToken = this.tokens.generateRefreshToken(payload);

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
      const payload = this.tokens.verifyRefreshToken(refreshToken);

      const storedToken = await this.dao.getRefreshToken(
        payload.userId,
        refreshToken
      );

      if (!storedToken) {
        throw new Error("Invalid refresh token");
      }

      const newAccessToken = this.tokens.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
      });

      const newRefreshToken = this.tokens.generateRefreshToken({
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

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.dao.deleteRefreshToken(userId, refreshToken);
  }

  async sendEmailVerification(inputData: EmailVerificationDTO) {
    const newToken = this.tokens.generateEmailToken();
    await this.dao.saveEmailToken(inputData.userId, newToken);
    const template = this.ses.loadTemplate("verify-email");
    const filled = template.replaceAll(
      "{{VERIFY_LINK}}",
      `https://infoscribe.me/auth/verify?token=${newToken}`
    );
    await this.ses.sendEmail(inputData.email, "Verify Your Email", filled);
  }

  async handleEmailVerification(token: string) {
    const user = await this.dao.getUserByEmailToken(token);
    await this.dao.activateUser(user.userId);
    await this.dao.disableToken(token);

    const payload: TokenPayloadDTO = {
      userId: user.userId,
      email: user.email,
    };

    const accessToken = this.tokens.generateAccessToken(payload);
    const refreshToken = this.tokens.generateRefreshToken(payload);

    await this.dao.saveRefreshToken(user.userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async sendPasswordResetEmail(inputData: PasswordResetValidationDTO) {
    const user = await this.dao.getUserByEmail(inputData.email);
    if (!user || user.username !== inputData.username)
      throw new Error("Either the email is wrong or the user does not exist");

    const newToken = this.tokens.generateEmailToken();
    await this.dao.saveEmailToken(user.userId, newToken);

    const template = this.ses.loadTemplate("reset-password");
    const filled = template.replaceAll(
      "{{RESET_LINK}}",
      `https://infoscribe.me/auth/reset-password?token=${newToken}`
    );
    await this.ses.sendEmail(inputData.email, "Reset Your Password", filled);
  }

  async resetPassword(inputData: PasswordResetRequestDTO) {
    const user = await this.dao.getUserByEmailToken(inputData.token);
    const hashedPassword = await bcrypt.hash(inputData.newPassword, 10);
    user.password = hashedPassword;

    const serialized = await serialize(UpdateUserRequestDTO, user);
    await this.dao.updateUser(serialized);
    await this.dao.disableToken(inputData.token);
  }
}
