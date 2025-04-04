import { DataClass } from "ts-data-object";

@DataClass()
export class CreateSubscriptionDTO {
  providerId!: string;
  userId!: string;
}

@DataClass()
export class GetSubscriptionDTO {
  subscriptionId!: string;
  subscribers!: number;
}

@DataClass()
export class GetAllSubscriptionOfUserDTO {
  subscriptions!: SubscriptionDTO[];
}

@DataClass()
class SubscriptionDTO {
  subscriptionId!: string;
  providerId!: string;
  title!: string;
  schedule!: string;
  summary!: string;
  tags!: string[];
  subscriptionDate!: Date;
}
