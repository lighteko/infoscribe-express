import { LetterDAO } from "@letter/dao/dao";
import {
  DispatchLetterDTO,
  GetLetterResponseDTO,
  GetLettersResponseDTO,
  GetUserInboxResponseDTO,
} from "@letter/dto/dto";
import SES from "@lib/infra/ses";
import S3 from "@lib/infra/s3";
import { serialize } from "ts-data-object";
export class LetterService {
  dao: LetterDAO;
  ses: SES;
  s3: S3;
  constructor() {
    this.dao = new LetterDAO();
    this.ses = SES.getInstance();
    this.s3 = S3.getInstance();
  }

  async getAllLettersOfProvider(providerId: string) {
    const packets = await this.dao.getAllLettersOfProvider(providerId);
    const letters = await serialize(GetLettersResponseDTO, packets);

    return letters;
  }

  async getLetter(letterId: string) {
    const packet = await this.dao.getLetter(letterId);
    const letter = await serialize(GetLetterResponseDTO, packet);
    const html = await this.s3.getObject(letter.s3Path);
    letter.html = html;

    return letter;
  }

  async dispatchLetter(inputData: DispatchLetterDTO) {
    const { providerId, title, s3Path, stage } = inputData;
    const letterId = await this.dao.createLetter({ providerId, title, s3Path });
    const subscribers = await this.dao.getAllSubscribers(providerId);

    for (const subscriber of subscribers) {
      try {
        const html = await this.s3.getObject(s3Path);

        if (!html) {
          console.error(`Empty HTML content received from S3 for ${s3Path}`);
          continue;
        }
        await this.ses.sendEmail(subscriber.email, title, html);
        await this.dao.createDispatch({
          letterId,
          userId: subscriber.userId,
          stage,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  async deleteDispatch(dispatchId: string) {
    this.dao.deleteDispatch(dispatchId);
  }

  async getUserInbox(userId: string) {
    const packets = await this.dao.getUserInbox(userId);
    const letters = await serialize(GetUserInboxResponseDTO, packets);

    return letters;
  }
}
