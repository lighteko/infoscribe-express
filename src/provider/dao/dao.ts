import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import {
  CreateProviderDTO,
  CreateSubscriptionDTO,
} from "@provider/dto/dto";
import { v4 as uuid4 } from "uuid";

export class ProviderDAO {
  db: DB;
  constructor() {
    this.db = new DB();
  }

  async createProvider(inputData: CreateProviderDTO) {
    const providerId = uuid4().toString();
    const providerQuery = SQL`
      INSERT INTO INSC_PVDR_L
        (PROVIDER_ID, CREATOR_ID, WKDAY, CREA_DT)
      VALUES (
        ${providerId},
        ${inputData.creatorId},
        ${inputData.weekday},
        CURRENT_TIMESTAMP
      )
    `;

    const categoriesQuery = SQL`
      INSERT INTO INSC_PV_CT_MAP_L
        (MAP_ID, PROVIDER_ID, CATEGORY_ID, CREA_DT)
      VALUES
    `;

    const categoryValues = inputData.categories.map(
      (category) =>
        SQL`(${uuid4().toString()}, ${providerId}, ${category}, CURRENT_TIMESTAMP)`
    );

    for (let value of categoryValues) {
      categoriesQuery.append(value);
    }

    const cursor = this.db.cursor();
    await cursor.execute(providerQuery);
    await cursor.execute(categoriesQuery);
  }

  async createSubscription(inputData: CreateSubscriptionDTO) {
    const query = SQL`
      INSERT INTO INSC_SBSC_L
        (SUBSC_ID, USER_ID, PROVIDER_ID, CREA_DT)
      VALUES (
        ${uuid4().toString()},
        ${inputData.userId},
        ${inputData.providerId},
        CURRENT_TIMESTAMP
      )
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async getAllProviders() {
    const query = SQL`
      SELECT 
        PROVIDER_ID as providerId,
        CREATOR_ID as creatorId,
        WKDAY as weekday,
        CREA_DT as createdDate
      FROM INSC_PVDR_L
    `;

    const cursor = this.db.cursor();
    const rows = await cursor.fetchAll(query);

    return rows;
  }

  async getProvider(providerId: string) {
    const query = SQL`
      SELECT 
        PROVIDER_ID as providerId,
        CREATOR_ID as creatorId,
        WKDAY as weekday,
        CREA_DT as createdDate
      FROM INSC_PVDR_L
      WHERE PROVIDER_ID = ${providerId}
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);

    return row;
  }

  async deleteSubscription(subscriptionId: string) {
    const query = SQL`
      DELETE FROM INSC_SBSC_L
      WHERE SUBSC_ID = ${subscriptionId}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }
}
