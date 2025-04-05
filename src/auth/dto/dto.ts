import { DataClass, Exclude } from "ts-data-object";

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
  pwd!: string;
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
}

@DataClass()
export class LoginUserResponseDTO {
  userId!: string;
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;

  @Exclude()
  pwd!: string;

  @Exclude()
  isVerified!: boolean;
}

@DataClass()
export class UserPayloadDTO {
  userId!: string;
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  pwd!: string;
  isVerified!: string;
}

@DataClass()
export class GetUserResponseDTO {
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  plan!: string;
}
