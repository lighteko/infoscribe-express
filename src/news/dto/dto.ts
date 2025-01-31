import { Expose } from "class-transformer";

export class CreateProviderDTO {
  @Expose()
  creatorId!: string;

  @Expose()
  language!: string;

  @Expose()
  categories!: string[];

  @Expose()
  weekday!: string;
}

export class CreateSubscriptionDTO {
  @Expose()
  providerId!: string;

  @Expose()
  userId!: string;
}
