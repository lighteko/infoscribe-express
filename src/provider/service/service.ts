import EventBridge from "@lib/infra/bridge";
import { ProviderDAO } from "@provider/dao/dao";
import { CreateProviderDTO, CreateSubscriptionDTO } from "@provider/dto/dto";

export class ProviderService {
  dao: ProviderDAO;
  bridge: EventBridge;

  constructor() {
    this.dao = new ProviderDAO();
    this.bridge = new EventBridge();
  }

  async getAllProviders() {
    return this.dao.getAllProviders();
  }

  async getProvider(providerId: string) {
    return this.dao.getProvider(providerId);
  }

  async createProvider(inputData: CreateProviderDTO) {
    this.dao.createProvider(inputData);
  }

  async createSubscription(inputData: CreateSubscriptionDTO) {
    // TODO: create scheduler
    this.dao.createSubscription(inputData);
  }

  async deleteSubscription(subscriptionId: string) {
    // TODO: Terminate scheduler
    this.dao.deleteSubscription(subscriptionId);
  }
}
