import { DataClass } from "ts-data-object";

@DataClass()
export class CreateProviderDTO {
  userId!: string;
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
export class GetProviderResponseDTO {
  providerId!: string;
  userId!: string;
  weekday!: string;
  categories!: string[];
  createdDate!: Date;
}

@DataClass()
export class GetAllProvidersResponseDTO {
  providers!: GetProviderResponseDTO[];
}
