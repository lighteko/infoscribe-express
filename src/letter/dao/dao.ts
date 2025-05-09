import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import { CreateLetterDTO, CreateDispatchDTO } from "@letter/dto/dto";
import { v4 as uuid4 } from "uuid";

export class LetterDAO {
  db: DB;
  constructor() {
    this.db = DB.getInstance();
  }

  async createLetter(inputData: CreateLetterDTO) {
    const letterId = uuid4().toString();
    const query = SQL`
      INSERT INTO INSC_LETTER_L
        (LETTER_ID, PROVIDER_ID, TITLE, S3_PATH)
      VALUES (
        ${letterId},
        ${inputData.providerId},
        ${inputData.title},
        ${inputData.s3Path}
      )
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);

    return letterId;
  }

  async createDispatch(inputData: CreateDispatchDTO) {
    const query = SQL`
      INSERT INTO INSC_LETTER_DISPATCH_L
        (DISPATCH_ID, LETTER_ID, USER_ID, STAGE)
      VALUES (
        ${uuid4().toString()},
        ${inputData.letterId},
        ${inputData.userId},
        ${inputData.stage}
      )
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async getAllLettersOfProvider(providerId: string) {
    const query = SQL`
      SELECT 
        LETTER_ID AS letterId,
        TITLE AS title,
        S3_PATH AS s3Path,
        CREA_DT AS createdDate
      FROM INSC_LETTER_L
      WHERE PROVIDER_ID = ${providerId}
    `;

    const cursor = this.db.cursor();
    const rows = await cursor.fetchAll(query);

    return rows;
  }

  async getLetter(letterId: string) {
    const query = SQL`
      SELECT 
        LETTER_ID AS letterId,
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

  async getAllSubscribers(providerId: string) {
    const query = SQL`
      SELECT 
        u.USER_ID AS userId,
        u.EMAIL AS email
      FROM INSC_SUBSCRIPTION_L s  
      LEFT JOIN INSC_USER_L u ON s.USER_ID = u.USER_ID
      WHERE s.PROVIDER_ID = ${providerId}
    `;

    const cursor = this.db.cursor();
    const rows = await cursor.fetchAll(query);

    return rows;
  }

  async getUserInbox(userId: string) {
    const query = SQL`
      SELECT 
        p.PROVIDER_ID AS providerId,
        p.TITLE AS providerTitle,
        l.LETTER_ID AS letterId,
        l.TITLE AS title,
        l.S3_PATH AS s3Path,
        l.CREA_DT AS createdDate
      FROM INSC_LETTER_L l
      LEFT JOIN INSC_LETTER_DISPATCH_L d ON l.LETTER_ID = d.LETTER_ID
      LEFT JOIN INSC_PROVIDER_L p ON l.PROVIDER_ID = p.PROVIDER_ID
      WHERE d.USER_ID = ${userId}
      ORDER BY l.CREA_DT DESC
    `;

    const cursor = this.db.cursor();
    const rows = await cursor.fetchAll(query);

    return rows;
  }
}
