import DB from "@lib/infra/mysql";
import SQL, { SQLStatement } from "sql-template-strings";
import { CreateProviderDTO } from "@provider/dto/dto";
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
        ${inputData.summary},
        ${inputData.schedule},
        ${inputData.locale}
      )
    `;

    const tagsQuery = SQL``;

    // Handle empty tags array
    if (inputData.tags.length === 0) {
      tagsQuery.append(SQL`
        -- No tags to insert
      `);
    } else {
      // Create a union-based approach instead of VALUES clause
      tagsQuery.append(SQL`
        INSERT INTO INSC_TAG_L (TAG_ID, TAG)
        SELECT t.id, t.tag FROM (
      `);

      inputData.tags.forEach((tag, index) => {
        if (index > 0) tagsQuery.append(SQL` UNION ALL `);
        tagsQuery.append(
          SQL`SELECT ${uuid4().toString()} AS id, ${tag} AS tag`
        );
      });

      tagsQuery.append(SQL`
        ) AS t
        LEFT JOIN INSC_TAG_L d ON d.TAG = t.tag
        WHERE d.TAG IS NULL
      `);
    }

    const providerTagMapQueries: SQLStatement[] = inputData.tags.map((tag) => {
      return SQL`
        INSERT INTO INSC_PROVIDER_TAG_MAP_L (MAP_ID, PROVIDER_ID, TAG_ID)
        SELECT ${uuid4().toString()}, ${providerId}, TAG_ID
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

  async getAllProviders() {
    const query = SQL`
      SELECT 
        p.PROVIDER_ID AS providerId,
        p.USER_ID AS userId,
        p.TITLE AS title,
        p.SUMMARY AS summary,
        p.SCHEDULE AS schedule,
        p.LOCALE AS locale,
        JSON_ARRAYAGG(t.TAG) AS tags, 
        p.CREA_DT AS createdDate
      FROM INSC_PROVIDER_L p
      LEFT JOIN INSC_PROVIDER_TAG_MAP_L m ON p.PROVIDER_ID = m.PROVIDER_ID
      LEFT JOIN INSC_TAG_L t ON t.TAG_ID = m.TAG_ID
      GROUP BY p.PROVIDER_ID
    `;

    const cursor = this.db.cursor();
    const rows = await cursor.fetchAll(query);

    return rows;
  }

  async getAllProvidersOfUser(userId: string) {
    const query = SQL`
      SELECT 
        p.PROVIDER_ID AS providerId,
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
        COUNT(DISTINCT s.USER_ID) AS subscribers
      FROM INSC_PROVIDER_L p
      LEFT JOIN INSC_SUBSCRIPTION_L s ON p.PROVIDER_ID = s.PROVIDER_ID
      WHERE p.USER_ID = ${userId}
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
