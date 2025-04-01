import DB from "@lib/infra/mysql";
import SQL, { SQLStatement } from "sql-template-strings";
import { CreateProviderDTO, CreateSubscriptionDTO } from "@provider/dto/dto";
import { v4 as uuid4 } from "uuid";

export class ProviderDAO {
  db: DB;
  constructor() {
    this.db = DB.getInstance();
  }

  async createProvider(inputData: CreateProviderDTO) {
    const providerId = uuid4().toString();

    const providerQuery = SQL`
      INSERT INTO INSC_PROVIDER_L
        (PROVIDER_ID, USER_ID, TITLE, SUMMARY, SCHEDULE, LOCALE)
      VALUES (
        ${providerId},
        ${inputData.userId},
        ${inputData.title},
        ${inputData.schedule},
        ${inputData.schedule},
        ${inputData.locale}
      )
    `;

    const tagsQuery = SQL`
      WITH INPUT_TAGS(TAG) AS (
        VALUES
    `;
    inputData.tags.forEach((tag, index) => {
      if (index > 0) tagsQuery.append(", ");
      tagsQuery.append(SQL`(${tag})`);
    });
    tagsQuery.append(SQL`
      ),
      TO_INSERT AS (
        SELECT t.TAG
        FROM INPUT_TAGS t
        LEFT JOIN INSC_TAG_L d ON d.TAG = t.TAG
        WHERE d.TAG IS NULL
      )
      INSERT INTO INSC_TAG_L (TAG)
      SELECT TAG
      FROM TO_INSERT;
    `);

    const providerTagMapQueries: SQLStatement[] = inputData.tags.map((tag) => {
      return SQL`
        INSERT INTO INSC_PROVIDER_TAG_MAP_L (PROVIDER_ID, TAG_ID)
        SELECT ${providerId}, TAG_ID
        FROM INSC_TAG_L
        WHERE TAG = ${tag};
      `;
    });

    const subscriptionQuery = SQL`
      INSERT INTO INSC_SUBSCRIPTION_L
        (SUBSCRIPTION_ID, USER_ID, PROVIDER_ID)
      VALUES (
        ${uuid4().toString()},
        ${inputData.userId},
        ${providerId}
      )
    `;

    const cursor = this.db.cursor();
    const queries = [
      providerQuery,
      tagsQuery,
      ...providerTagMapQueries,
      subscriptionQuery,
    ];
    await cursor.execute(...queries);

    return providerId;
  }

  async createSubscription(inputData: CreateSubscriptionDTO) {
    const subscriptionId = uuid4().toString();
    const query = SQL`
      INSERT INTO INSC_SUBSCRIPTION_L
        (SUBSCRIPTION_ID, USER_ID, PROVIDER_ID, CREA_DT)
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
        p.SCHEDULE AS schedule,
        p.LOCALE AS locale,
        JSON_ARRAYAGG(t.NAME) AS categories, 
        p.CREA_DT AS createdDate
      FROM INSC_PROVIDER_L p
      LEFT JOIN INSC_PROVIDER_TAG_MAP_L map ON p.PROVIDER_ID = map.PROVIDER_ID
      LEFT JOIN INSC_TAG_L t ON t.TAG_ID = map.TAG_ID
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
        p.SCHEDULE AS schedule,
        p.LOCALE AS locale,
        JSON_ARRAYAGG(t.TAG) AS tags, 
        p.CREA_DT AS createdDate
      FROM INSC_PROVIDER_L p
      LEFT JOIN INSC_PROVIDER_TAG_MAP_L map ON p.PROVIDER_ID = map.PROVIDER_ID
      LEFT JOIN INSC_TAG_L t ON t.TAG_ID = map.TAG_ID
      WHERE p.PROVIDER_ID = ${providerId}
      GROUP BY p.PROVIDER_ID
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);

    return row;
  }

  async deleteSubscription(subscriptionId: string) {
    const query = SQL`
      DELETE FROM INSC_SUBSCRIPTION_L
      WHERE SUBSCRIPTION_ID = ${subscriptionId}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async getSubscriberCount(providerId: string) {
    const query = SQL`
      SELECT COUNT(*)
      FROM INSC_PROVIDER_TAG_MAP_L
      WHERE PROVIDER_ID = ${providerId}
    `;

    const cursor = this.db.cursor();
    const res = await cursor.fetchOne(query);
    return res as unknown as number;
  }

  async getSubscription(subscriptionId: string) {
    const query = SQL`
      SELECT *
      FROM INSC_SUBSCRIPTION_L
      WHERE SUBSCRIPTION_ID = ${subscriptionId}
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);
    return row;
  }
}
