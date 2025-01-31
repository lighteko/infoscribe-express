import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import { CreateProviderDTO, CreateSubscriptionDTO } from "../dto/dto";
import { v4 as uuid4 } from "uuid";

export class NewsDAO {
  db: DB;
  constructor() {
    this.db = new DB();
  }

  async createProvider(inputData: CreateProviderDTO) {
    const providerId = uuid4().toString();
    const provider_query = SQL`
      INSERT INTO INSC_PRVDR_L
        (PRVDR_ID, CREATR_ID, WKDAY, CREA_DT)
      VALUES (
        ${providerId},
        ${inputData.creatorId},
        ${inputData.weekday},
        CURRENT_TIMESTAMP
      )
    `;

    await this.db.withConnection(
      async (connection) => await connection.query(provider_query)
    );
  }
}
