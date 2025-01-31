import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import { CreateProviderDTO, CreateSubscriptionDTO } from "@news/dto/dto";
import { v4 as uuid4 } from "uuid";

export class NewsDAO {
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

    await this.db.withConnection(async (conn) => {
      try {
        await conn.beginTransaction();
        await conn.query(providerQuery);
        await conn.query(categoriesQuery);
        await conn.commit();
      } catch (error) {
        await conn.rollback();
        throw error;
      }
    });
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

    await this.db.withConnection(
      async (connection) => await connection.query(query)
    );
  }
}
