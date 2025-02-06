import { LetterDAO } from "@letter/dao/dao";
import { CreateDispatchDTO, CreateLetterDTO } from "@letter/dto/dto";

export class LetterService {
  dao: LetterDAO;

  constructor() {
    this.dao = new LetterDAO();
  }

  async getLetter(letterId: string) {
    return this.dao.getLetter(letterId);
  }

  async createLetter(inputData: CreateLetterDTO) {
    this.dao.createLetter(inputData);
  }

  async sendLetter(inputData: CreateDispatchDTO) {
    this.dao.createDispatch(inputData);
  }

  async deleteDispatch(dispatchId: string) {
    this.dao.deleteDispatch(dispatchId);
  }
}
