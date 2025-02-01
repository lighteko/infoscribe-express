import { Expose, Transform, Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";

export class CreateProviderDTO {
  creatorId!: string;
  language!: string;
  categories!: string[];
  weekday!: string;
}

export class CreateSubscriptionDTO {
  providerId!: string;
  userId!: string;
}

export class Provider {
  providerId!: string;
  creatorId!: string;
  weekday!: string;

  @IsArray()
  categories!: string[];
  

  @Transform(({ value }) => new Date(value))
  createdDate!: Date;
}

export class GetAllProvidersResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Provider)
  providers!: Provider[];
}
