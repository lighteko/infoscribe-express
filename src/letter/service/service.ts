import { LetterDAO } from "@letter/dao/dao";
import { DispatchLetterDTO } from "@letter/dto/dto";
import SES from "@lib/infra/ses";

export class LetterService {
  dao: LetterDAO;
  ses: SES;

  constructor() {
    this.dao = new LetterDAO();
    this.ses = SES.getInstance();
  }

  async getLetter(letterId: string) {
    return this.dao.getLetter(letterId);
  }

  async dispatchLetter(inputData: DispatchLetterDTO) {
    const { letterId, userId, providerId, title, s3Path, stage } = inputData;


    await this.dao.createLetter({ providerId, title, s3Path });
    await this.dao.createDispatch({ letterId, userId, stage });
  }

  async deleteDispatch(dispatchId: string) {
    this.dao.deleteDispatch(dispatchId);
  }
}
