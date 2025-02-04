import { ProviderDAO } from "@provider/dao/dao";
import { CreateProviderDTO, CreateSubscriptionDTO } from "@provider/dto/dto";

export class ProviderService {
  dao: ProviderDAO;

  constructor() {
    this.dao = new ProviderDAO();
  }

  async getAllProviders() {
    return this.dao.getAllProviders();
  }

  async getProvider(providerId: string) {
    return this.dao.getProvider(providerId);
  }

  async createProvider(inputData: CreateProviderDTO) {
    // TODO: creat scheduler
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
