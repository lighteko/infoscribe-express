import { NewsDAO } from "@news/dao/dao";
import { CreateProviderDTO, CreateSubscriptionDTO } from "@news/dto/dto";

export class NewsService {
  dao: NewsDAO;

  constructor() {
    this.dao = new NewsDAO();
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
