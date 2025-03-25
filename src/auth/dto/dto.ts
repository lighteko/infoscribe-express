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
  password!: string;
}

@DataClass()
export class EmailVerificationDTO {
  userId!: string;
  username!: string;
  email!: string;
}
