import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";

export class SubscriptionDAO {
  db: DB;

  constructor() {
    this.db = DB.getInstance();
  }

  async deleteSubscription(subscriptionId: string) {
    const query = SQL`
      DELETE FROM INSC_SUBSCRIPTION_L
      WHERE SUBSCRIPTION_ID = ${subscriptionId}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
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
        ) AS tags 
      FROM INSC_SUBSCRIPTION_L s
      LEFT JOIN INSC_PROVIDER_L p ON s.PROVIDER_ID = p.PROVIDER_ID
      WHERE s.USER_ID = ${userId}
      GROUP BY s.PROVIDER_ID
    `;

    const cursor = this.db.cursor();
    const rows = await cursor.fetchAll(query);
    return rows;
  }
}
