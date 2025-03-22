import { ProviderDAO } from "@provider/dao/dao";
import { CreateProviderDTO, CreateSubscriptionDTO } from "@provider/dto/dto";
import { EventService } from "./event-service";

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
    await this.event.publishProviderRoutine({ providerId, ...inputData });
  }

  async createSubscription(inputData: CreateSubscriptionDTO) {
    const subscribers = await this.dao.getSubscriberCount(inputData.providerId);
    await this.dao.createSubscription(inputData);
    if (subscribers === 0) {
      const provider = await this.dao.getProvider(inputData.providerId);
      await this.event.publishProviderRoutine({
        title: provider.title,
        sendingDay: provider.sendingDay,
        locale: provider.locale,
        categories: provider.categories,
        ...inputData,
      });
    }
  }

  async deleteSubscription(subscriptionId: string) {
    const res = await this.dao.getSubscription(subscriptionId);
    const subscribers = await this.dao.getSubscriberCount(res.providerId);
    if (subscribers === 1) {
      await this.event.killProviderRoutine(res.providerId);
    }
    await this.dao.deleteSubscription(subscriptionId);
  }
}
