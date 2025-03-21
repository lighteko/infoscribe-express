import { DataClass, Exclude } from "ts-data-object";

@DataClass()
export class LoginRequestDTO {
  username!: string;

  @Exclude()
  password!: string;
}

@DataClass()
export class LoginResponseDTO {
  userId!: string;
  username!: string;
  accessToken!: string;
  refreshToken!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
}

@DataClass()
export class RefreshTokenRequestDTO {
  refreshToken!: string;
}

@DataClass()
export class RefreshTokenResponseDTO {
  accessToken!: string;
  refreshToken!: string;
}

@DataClass()
export class TokenPayloadDTO {
  userId!: string;
  username!: string;
  iat?: number;
  exp?: number;
} 