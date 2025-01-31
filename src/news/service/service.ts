import { NewsDAO } from "@news/dao/dao";
import { CreateProviderDTO, CreateSubscriptionDTO } from "@news/dto/dto";

export class NewsService {
  dao: NewsDAO;

  constructor() {
    this.dao = new NewsDAO();
  }

  async getAllNewsProviders() {
    
  }
}
