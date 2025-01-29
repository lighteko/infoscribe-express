import { Expose, Exclude } from "class-transformer";

export class CreateNewsletterProviderDTO {
  @Expose()
  userId!: string;

  @Expose()
  country!: string;

  @Expose()
  language!: string;

  @Expose()
  categories!: string[];

  @Expose()
  sendingday!: string;
}

export class CreateSubscriptionDTO {
  @Expose()
  newsId!: string;

  @Expose()
  userId!: string;
}
