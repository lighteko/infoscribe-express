import { ProviderDAO } from "@provider/dao/dao";
import {
  CreateProviderDTO,
  CreateSubscriptionDTO,
  GetSubscriptionDTO,
  ProviderRoutineDTO,
} from "@provider/dto/dto";
import { EventService } from "./event-service";
import { serialize } from "ts-data-object";

export class ProviderService {
  dao: ProviderDAO;
  event: EventService;

  constructor() {
    this.dao = new ProviderDAO();
    this.event = new EventService();
  }

  async getAllProviders() {
    return this.dao.getAllProviders();
  }

  async getProvider(providerId: string) {
    return this.dao.getProvider(providerId);
  }

  async createProvider(inputData: CreateProviderDTO) {
    const providerId = await this.dao.createProvider(inputData);
    const provider = await this.dao.getProvider(providerId);
    const routineData = await serialize(ProviderRoutineDTO, provider);
    await this.event.publishProviderRoutine(routineData);
  }

  async createSubscription(inputData: CreateSubscriptionDTO) {
    const subscribers = await this.dao.getSubscriberCount(inputData.providerId);
    await this.dao.createSubscription(inputData);
    if (subscribers === 0) {
      const packet = await this.dao.getProvider(inputData.providerId);
      const provider = await serialize(ProviderRoutineDTO, packet);
      await this.event.publishProviderRoutine({
        title: provider.title,
        schedule: provider.schedule,
        locale: provider.locale,
        tags: provider.tags,
        ...inputData,
      });
    }
  }

  async deleteSubscription(subscriptionId: string) {
    const packet = await this.dao.getSubscription(subscriptionId);
    const subscription = await serialize(GetSubscriptionDTO, packet);
    const subscribers = await this.dao.getSubscriberCount(
      subscription.providerId
    );
    if (subscribers === 1) {
      await this.event.killProviderRoutine(subscription.providerId);
    }
    await this.dao.deleteSubscription(subscriptionId);
  }
}
