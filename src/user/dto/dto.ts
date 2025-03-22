import { DataClass, Exclude } from "ts-data-object";

@DataClass()
export class GetUserResponseDTO {
  userId!: string;
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
}

@DataClass()
export class UpdateUserRequestDTO {
  userId!: string;
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;

  @Exclude()
  password!: string;
}
