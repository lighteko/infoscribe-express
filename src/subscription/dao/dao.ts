import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";
import { CreateSubscriptionDTO } from "@subscription/dto/dto";

export class SubscriptionDAO {
  db: DB;

  constructor() {
    this.db = DB.getInstance();
  }

  async createSubscription(inputData: CreateSubscriptionDTO) {
    const subscriptionId = uuid4().toString();
    const query = SQL`
        INSERT INTO INSC_SUBSCRIPTION_L
          (SUBSCRIPTION_ID, USER_ID, PROVIDER_ID)
        VALUES (
          ${subscriptionId},
          ${inputData.userId},
          ${inputData.providerId}
        )
      `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
    return subscriptionId;
  }

  async getSubscription(subscriptionId: string) {
    const query = SQL`
      SELECT
        p.PROVIDER_ID AS providerId,
        COUNT(DISTINCT s.USER_ID) AS subscribers
      FROM INSC_SUBSCRIPTION_L s
      LEFT JOIN INSC_PROVIDER_L p ON s.PROVIDER_ID = p.PROVIDER_ID
      WHERE s.SUBSCRIPTION_ID = ${subscriptionId}
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);
    return row;
  }

  async getAllSubscriptionsOfUser(userId: string) {
    const query = SQL`
      SELECT 
        s.SUBSCRIPTION_ID AS subscriptionId,
        p.PROVIDER_ID AS providerId,
        p.TITLE AS title,
        p.SCHEDULE AS schedule,
        p.SUMMARY AS summary,
        (
          SELECT JSON_ARRAYAGG(tag.TAG)
          FROM (
            SELECT DISTINCT t.TAG
            FROM INSC_PROVIDER_TAG_MAP_L m
            JOIN INSC_TAG_L t ON t.TAG_ID = m.TAG_ID
            WHERE m.PROVIDER_ID = p.PROVIDER_ID
          ) tag
        ) AS tags,
        s.CREA_DT AS subscriptionDate
      FROM INSC_SUBSCRIPTION_L s
      LEFT JOIN INSC_PROVIDER_L p ON s.PROVIDER_ID = p.PROVIDER_ID
      WHERE s.USER_ID = ${userId}
      GROUP BY s.SUBSCRIPTION_ID
    `;

    const cursor = this.db.cursor();
    const rows = await cursor.fetchAll(query);
    return rows;
  }
  
  async deleteSubscription(subscriptionId: string) {
    const query = SQL`
      DELETE FROM INSC_SUBSCRIPTION_L
      WHERE SUBSCRIPTION_ID = ${subscriptionId}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async getProvider(providerId: string) {
    const query = SQL`
      SELECT 
        p.PROVIDER_ID AS providerId,
        u.USERNAME AS creator,
        p.TITLE AS title,
        p.SCHEDULE AS schedule,
        p.SUMMARY AS summary,
        p.LOCALE AS locale,
        (
          SELECT JSON_ARRAYAGG(tag.TAG)
          FROM (
            SELECT DISTINCT t.TAG
            FROM INSC_PROVIDER_TAG_MAP_L m
            JOIN INSC_TAG_L t ON t.TAG_ID = m.TAG_ID
            WHERE m.PROVIDER_ID = p.PROVIDER_ID
          ) tag
        ) AS tags, 
        COUNT(DISTINCT s.USER_ID) AS subscribers,
        p.CREA_DT AS createdDate
      FROM INSC_PROVIDER_L p
      LEFT JOIN INSC_SUBSCRIPTION_L s ON p.PROVIDER_ID = s.PROVIDER_ID
      LEFT JOIN INSC_USER_L u ON p.USER_ID = u.USER_ID
      WHERE p.PROVIDER_ID = ${providerId}
      GROUP BY p.PROVIDER_ID
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);

    return row;
  }
}
