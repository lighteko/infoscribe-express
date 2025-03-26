import { DataClass } from "ts-data-object";

@DataClass()
export class TokenPayloadDTO {
  userId!: string;
  email!: string;
  iat?: number;
  exp?: number;
}

@DataClass()
export class SignUpRequestDTO {
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
}

@DataClass()
export class EmailVerificationDTO {
  userId!: string;
  username!: string;
  email!: string;
}

@DataClass()
export class PasswordResetValidationDTO {
  username!: string;
  email!: string;
}

@DataClass()
export class PasswordResetRequestDTO {
  token!: string;
  newPassword!: string;
}

@DataClass()
export class UpdateUserRequestDTO {
  userId!: string;
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
  isVerified!: boolean;
}
