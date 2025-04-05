import { ProviderDAO } from "@provider/dao/dao";
import { CreateProviderDTO, ProviderRoutineDTO } from "@provider/dto/dto";
import { EventService } from "@common/event-service";
import { serialize } from "ts-data-object";

export class ProviderService {
  dao: ProviderDAO;
  event: EventService;

  constructor() {
    this.dao = new ProviderDAO();
    this.event = new EventService();
  }

  async getAllProvidersOfUser(userId: string) {
    return this.dao.getAllProvidersOfUser(userId);
  }

  async getProvider(providerId: string) {
    return this.dao.getProvider(providerId);
  }

  async createProvider(inputData: CreateProviderDTO) {
    const providerId = await this.dao.createProvider(inputData);
    const provider = await this.dao.getProvider(providerId);
    const routineData = await serialize(ProviderRoutineDTO, provider!);
    await this.event.publishProviderRoutine(routineData);
  }

  async getAllSubscribableProviders(userId: string) {
    return this.dao.getAllSubscribableProviders(userId);
  }

  async deleteProvider(userId: string, providerId: string) {
    return this.dao.deleteProvider(userId, providerId);
  }
}
