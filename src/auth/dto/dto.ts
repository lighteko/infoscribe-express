import { DataClass } from "ts-data-object";

@DataClass()
export class TokenPayloadDTO {
  userId!: string;
  email!: string;
  iat?: number;
  exp?: number;
} 