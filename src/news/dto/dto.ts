import { Expose } from "class-transformer";

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

class Provider {
  providerId!: string;
}

export class GetAllProvidersResponse {}
