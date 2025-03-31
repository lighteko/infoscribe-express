import { DataClass } from "ts-data-object";

@DataClass()
export class CreateProviderDTO {
  userId!: string;
  title!: string;
  locale!: string;
  tagIds!: string[];
  tags!: string[];
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
  sendingDay!: string;
  locale!: string;
  tags!: string[];
}
