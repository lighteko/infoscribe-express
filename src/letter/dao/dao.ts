import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import { CreateDispatchDTO, CreateLetterDTO } from "@letter/dto/dto";
import { v4 as uuid4 } from "uuid";

export class LetterDAO {
  db: DB;
  constructor() {
    this.db = new DB();
  }

  async createLetter(inputData: CreateLetterDTO) {
    const query = SQL`
      INSERT INTO INSC_LETTER_L
        (LETTER_ID, PROVIDER_ID, TITLE, S3_PATH, CREA_DT)
      VALUES (
        ${uuid4().toString()},
        ${inputData.providerId},
        ${inputData.title},
        ${inputData.s3Path},
        CURRENT_TIMESTAMP
      )
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async createDispatch(inputData: CreateDispatchDTO) {
    const query = SQL`
      INSERT INTO INSC_LETTER_DISPATCH_L
        (DISPATCH_ID, LETTER_ID, USER_ID, STATUS, SENT_DT)
      VALUES (
        ${uuid4().toString()},
        ${inputData.letterId},
        ${inputData.userId},
        ${inputData.status},
        CURRENT_TIMESTAMP
      )
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async getLetter(letterId: string) {
    const query = SQL`
      SELECT 
        LETTER_ID AS letterId,
        PROVIDER_ID AS providerId,
        TITLE AS title,
        S3_PATH AS s3Path,
        CREA_DT AS createdDate
      FROM INSC_LETTER_L
      WHERE LETTER_ID = ${letterId}
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);

    return row;
  }

  async deleteDispatch(dispatchId: string) {
    const query = SQL`
      DELETE FROM INSC_LETTER_DISPATCH_L
      WHERE DISPATCH_ID = ${dispatchId}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }
}
