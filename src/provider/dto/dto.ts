import { DataClass } from "ts-data-object";

@DataClass()
export class CreateProviderDTO {
  userId!: string;
  title!: string;
  locale!: string;
  categories!: string[];
  sendingDay!: string;
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
  title!: string;
  sendingDay!: string;
  locale!: string;
  categories!: string[];
  createdDate!: Date;
}

@DataClass()
export class GetAllProvidersResponseDTO {
  providers!: GetProviderResponseDTO[];
}
