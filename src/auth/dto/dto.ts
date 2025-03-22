import { DataClass } from "ts-data-object";

@DataClass()
export class TokenPayloadDTO {
  userId!: string;
  username!: string;
  iat?: number;
  exp?: number;
} 