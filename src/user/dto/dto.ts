import { Exclude } from "class-transformer";

export class GetUserResponseDTO {
  userId!: string;
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
}

export class CreateUserRequestDTO {
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;

  @Exclude()
  password!: string;
}

export class UpdateUserRequestDTO {
  userId!: string;
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;

  @Exclude()
  password!: string;
}
