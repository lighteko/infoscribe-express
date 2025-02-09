import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import { CreateProviderDTO, CreateSubscriptionDTO } from "@provider/dto/dto";
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
        (PROVIDER_ID, USER_ID, TITLE, SENDING_DAY, LOCALE, CREA_DT)
      VALUES (
        ${providerId},
        ${inputData.userId},
        ${inputData.title},
        ${inputData.sendingDay},
        ${inputData.locale},
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

    const subscriptionQuery = SQL`
      INSERT INTO INSC_SBSC_L
        (SUBSC_ID, USER_ID, PROVIDER_ID, CREA_DT)
      VALUES (
        ${uuid4().toString()},
        ${inputData.userId},
        ${providerId},
        CURRENT_TIMESTAMP
      )
    `;

    const cursor = this.db.cursor();
    await cursor.execute(providerQuery);
    await cursor.execute(categoriesQuery);
    await cursor.execute(subscriptionQuery);
    return providerId;
  }

  async createSubscription(inputData: CreateSubscriptionDTO) {
    const subscriptionId = uuid4().toString();
    const query = SQL`
      INSERT INTO INSC_SBSC_L
        (SUBSC_ID, USER_ID, PROVIDER_ID, CREA_DT)
      VALUES (
        ${subscriptionId},
        ${inputData.userId},
        ${inputData.providerId},
        CURRENT_TIMESTAMP
      )
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
    return subscriptionId;
  }

  async getAllProviders() {
    const query = SQL`
      SELECT 
        p.PROVIDER_ID AS providerId,
        p.USER_ID AS userId,
        p.title AS title,
        p.SENDING_DAY AS sendingDay,
        p.LOCALE AS locale,
        JSON_ARRAYAGG(c.NAME) AS categories, 
        p.CREA_DT AS createdDate
      FROM INSC_PVDR_L p
      LEFT JOIN INSC_PV_CT_MAP_L map ON p.PROVIDER_ID = map.PROVIDER_ID
      LEFT JOIN INSC_CTGY_M c ON c.CATEGORY_ID = map.CATEGORY_ID
      GROUP BY p.PROVIDER_ID
    `;

    const cursor = this.db.cursor();
    const rows = await cursor.fetchAll(query);

    return rows;
  }

  async getProvider(providerId: string) {
    const query = SQL`
      SELECT 
        p.PROVIDER_ID AS providerId,
        p.USER_ID AS userId,
        p.title AS title,
        p.SENDING_DAY AS sendingDay,
        p.LOCALE AS locale,
        JSON_ARRAYAGG(c.NAME) AS categories, 
        p.CREA_DT AS createdDate
      FROM INSC_PVDR_L p
      LEFT JOIN INSC_PV_CT_MAP_L map ON p.PROVIDER_ID = map.PROVIDER_ID
      LEFT JOIN INSC_CTGY_M c ON c.CATEGORY_ID = map.CATEGORY_ID
      WHERE p.PROVIDER_ID = ${providerId}
      GROUP BY p.PROVIDER_ID
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

  async getSubscriberCount(providerId: string) {
    const query = SQL`
      SELECT COUNT(*)
      FROM INSC_PV_CT_MAP_L
      WHERE PROVIDER_ID = ${providerId}
    `;

    const cursor = this.db.cursor();
    const res = await cursor.fetchOne(query);
    return res as unknown as number;
  }

  async getSubscription(subscriptionId: string) {
    const query = SQL`
      SELECT *
      FROM INSC_SBSC_L
      WHERE SUBSC_ID = ${subscriptionId}
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);
    return row;
  }
}
