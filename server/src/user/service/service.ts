import { UserDAO } from "@user/dao/dao";
import { CreateUserRequestDTO, UpdateUserRequestDTO } from "@user/dto/dto";

export class UserService {
  dao: UserDAO;
  
  constructor() {
    this.dao = new UserDAO();
  }

  async getUser(userId: string) {
    return await this.dao.getUser(userId);
  }

  async createUser(inputData: CreateUserRequestDTO) {
    await this.dao.createUser(inputData);
  }

  async updateUser(inputData: UpdateUserRequestDTO) {
    await this.dao.updateUser(inputData);
  }
}