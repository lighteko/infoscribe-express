import { Expose, Exclude } from 'class-transformer';

export class GetUserResponseDTO {
  @Expose()
  id!: number;

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

export class CreateUserRequestDTO {
  @Expose()
  username!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  password!: string;

  @Expose()
  email!: string;
}