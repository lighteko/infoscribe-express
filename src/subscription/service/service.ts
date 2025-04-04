import {
  CreateSubscriptionDTO,
  GetAllSubscriptionOfUserDTO,
  GetSubscriptionDTO,
} from "@subscription/dto/dto";
import { SubscriptionDAO } from "@subscription/dao/dao";
import { EventService } from "@src/common/event-service";
import { serialize } from "ts-data-object";
import { ProviderRoutineDTO } from "@src/provider/dto/dto";

export class SubscriptionService {
  dao: SubscriptionDAO;
  event: EventService;

  constructor() {
    this.dao = new SubscriptionDAO();
    this.event = new EventService();
  }
  async createSubscription(inputData: CreateSubscriptionDTO) {
    const packet = await this.dao.getProvider(inputData.providerId);
    const provider = await serialize(ProviderRoutineDTO, packet!);
    await this.dao.createSubscription(inputData);
    if (provider.subscribers === 0) {
      await this.event.publishProviderRoutine({
        ...provider,
        ...inputData,
      });
    }
  }

  async getAllSubscriptionOfUser(userId: string) {
    const packet = await this.dao.getAllSubscriptionsOfUser(userId);
    const data = serialize(GetAllSubscriptionOfUserDTO, packet!);
    return data;
  }

  async deleteSubscription(subscriptionId: string) {
    const packet = await this.dao.getSubscription(subscriptionId);
    const { providerId, subscribers } = await serialize(
      GetSubscriptionDTO,
      packet!
    );
    if (subscribers === 1) {
      await this.event.killProviderRoutine(providerId);
    }
    await this.dao.deleteSubscription(subscriptionId);
  }
}
