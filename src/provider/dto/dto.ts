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
export class GetProviderResponseDTO {
  providerId!: string;
  title!: string;
  summary!: string;
  schedule!: string;
  tags!: string[];
  subscribers!: number;
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
  subscribers!: number;
}

@DataClass()
export class UpdateProviderDTO {
  providerId!: string;
  userId!: string;
  title!: string;
  summary!: string;
  schedule!: string;
  locale!: string;
}
