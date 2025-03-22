import { UserDAO } from "@user/dao/dao";
import { UpdateUserRequestDTO } from "@user/dto/dto";

export class UserService {
  dao: UserDAO;
  
  constructor() {
    this.dao = new UserDAO();
  }

  async getUser(userId: string) {
    return await this.dao.getUser(userId);
  }

  async updateUser(inputData: UpdateUserRequestDTO) {
    await this.dao.updateUser(inputData);
  }
}