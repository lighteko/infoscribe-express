import { DispatchStage } from "@src/common/enums";
import { DataClass, IsOptional } from "ts-data-object";

@DataClass()
export class CreateLetterDTO {
  providerId!: string;
  title!: string;
  s3Path!: string;
}

@DataClass()
export class GetLetterDTO {
  letterId!: string;
  providerId!: string;
  title!: string;
  s3Path!: string;
  createdDate!: Date;
}

@DataClass()
export class CreateDispatchDTO {
  letterId!: string;
  userId!: string;

  @IsOptional()
  stage!: DispatchStage;
}

@DataClass()
export class DispatchLetterDTO {
  providerId!: string;

  title!: string;
  s3Path!: string;

  @IsOptional()
  stage!: DispatchStage;
}
