import { DataClass } from "ts-data-object"

@DataClass()
export class CreateProviderDTO {
  creatorId!: string;
  language!: string;
  categories!: string[];
  weekday!: string;
}

@DataClass()
export class CreateSubscriptionDTO {
  providerId!: string;
  userId!: string;
}

@DataClass()
export class Provider {
  providerId!: string;
  creatorId!: string;
  weekday!: string;
  categories!: string[];
  createdDate!: Date;
}

@DataClass()
export class GetAllProvidersResponse {
  providers!: Provider[];
}
