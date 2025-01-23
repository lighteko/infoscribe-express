import { Expose, Exclude } from "class-transformer";

export class GetUserResponseDTO {
  @Expose()
  userId!: string;

  @Expose()
  username!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  email!: string;
}

export class CreateUserRequestDTO {
  @Expose()
  username!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Exclude()
  password!: string;

  @Expose()
  email!: string;
}

export class UpdateUserRequestDTO {
  @Expose()
  userId!: string;

  @Expose()
  username!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  email!: string;
  
  @Exclude()
  password!: string;
}
