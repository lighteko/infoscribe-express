import { DataClass } from "ts-data-object";

@DataClass()
export class CreateProviderDTO {
  userId!: string;
  title!: string;
  summary!: string;
  locale!: string;
  tags!: string[];
  schedule!: string;
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
  schedule!: string;
  locale!: string;
  tags!: string[];
  createdDate!: Date;
}

@DataClass()
export class GetAllProvidersResponseDTO {
  providers!: GetProviderResponseDTO[];
}

@DataClass()
export class ProviderRoutineDTO {
  providerId!: string;
  userId!: string;
  title!: string;
  schedule!: string;
  locale!: string;
  tags!: string[];
}

@DataClass()
export class GetSubscriptionDTO {
  providerId!: string;
}
