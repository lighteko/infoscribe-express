import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";
import { UpdateUserRequestDTO, SignUpRequestDTO } from "@auth/dto/dto";

export class AuthDAO {
  db: DB;
  constructor() {
    this.db = DB.getInstance();
  }

  async createUser(inputData: SignUpRequestDTO) {
    const userId = uuid4().toString();
    const query = SQL`
      INSERT INTO INSC_USER_L 
        (USER_ID, USERNAME, FIRST_NM, LAST_NM, PASSWRD, EMAIL, IS_VERIFIED, PLAN_ID)
      SELECT
        ${userId},
        ${inputData.username},
        ${inputData.firstName},
        ${inputData.lastName},
        ${inputData.pwd},
        ${inputData.email},
        FALSE,
        PLAN_ID
      FROM INSC_PLANS_M
      WHERE TITLE = 'Free'
    `;
    const cursor = this.db.cursor();
    await cursor.execute(query);
    return userId;
  }

  async updateUser(inputData: UpdateUserRequestDTO) {
    const query = SQL`
      UPDATE INSC_USER_L
      SET USERNAME = ${inputData.username},
          FIRST_NM = ${inputData.firstName},
          LAST_NM = ${inputData.lastName}
      WHERE USER_ID = ${inputData.userId}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async updateUserPassword(userId: string, password: string) {
    const query = SQL`
      UPDATE INSC_USER_L
      SET PASSWRD = ${password}
      WHERE USER_ID = ${userId}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async deleteUser(userId: string) {
    const emailQuery = SQL`
      DELETE FROM INSC_PENDING_EMAIL_L
      WHERE USER_ID = ${userId}
    `;

    const emailTokenQuery = SQL`
      DELETE FROM INSC_EMAIL_TOKEN_L
      WHERE USER_ID = ${userId}
    `;

    const refreshTokenQuery = SQL`
      DELETE FROM INSC_REFRESH_TOKEN_L
      WHERE USER_ID = ${userId}
    `;

    const tagQuery = SQL`
      DELETE m
      FROM INSC_PROVIDER_TAG_MAP_L m
      JOIN INSC_PROVIDER_L p ON m.PROVIDER_ID = p.PROVIDER_ID
      WHERE p.USER_ID = ${userId}
    `;

    const subscriptionQuery = SQL`
      DELETE FROM INSC_SUBSCRIPTION_L
      WHERE USER_ID = ${userId}
    `;

    const providerQuery = SQL`
      DELETE FROM INSC_PROVIDER_L
      WHERE USER_ID = ${userId}
    `;

    const userQuery = SQL`
      DELETE FROM INSC_USER_L
      WHERE USER_ID = ${userId}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(
      emailQuery,
      emailTokenQuery,
      refreshTokenQuery,
      tagQuery,
      subscriptionQuery,
      providerQuery,
      userQuery
    );
  }

  async activateUser(userId: string) {
    const query = SQL`
    UPDATE INSC_USER_L
    SET IS_VERIFIED = TRUE 
    WHERE USER_ID = ${userId}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async getUserByEmail(email: string) {
    const query = SQL`
      SELECT
        USER_ID AS userId,
        USERNAME AS username,
        FIRST_NM AS firstName,
        LAST_NM AS lastName,
        EMAIL AS email,
        PASSWRD AS pwd,
        IS_VERIFIED AS isVerified
      FROM INSC_USER_L
      WHERE EMAIL = ${email}
    `;
    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);
    return row;
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    const tokenId = uuid4().toString();
    const query = SQL`
      INSERT INTO INSC_REFRESH_TOKEN_L
        (TOKEN_ID, USER_ID, TOKEN)
      VALUES (
        ${tokenId},
        ${userId},
        ${refreshToken}
      )
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async getRefreshToken(userId: string, refreshToken: string) {
    const query = SQL`
      SELECT
        TOKEN_ID AS tokenId,
        USER_ID AS userId,
        TOKEN AS token
      FROM INSC_REFRESH_TOKEN_L
      WHERE USER_ID = ${userId}
      AND TOKEN = ${refreshToken}
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);

    return row;
  }

  async replaceRefreshToken(
    userId: string,
    oldToken: string,
    newToken: string
  ) {
    const query = SQL`
      UPDATE INSC_REFRESH_TOKEN_L
      SET TOKEN = ${newToken},
          UPDT_DT = CURRENT_TIMESTAMP
      WHERE USER_ID = ${userId}
      AND TOKEN = ${oldToken}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async deleteRefreshToken(userId: string, refreshToken: string) {
    const query = SQL`
      DELETE FROM INSC_REFRESH_TOKEN_L
      WHERE USER_ID = ${userId}
      AND TOKEN = ${refreshToken}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async saveEmailToken(userId: string, token: string) {
    const tokenId = uuid4().toString();
    const query = SQL`
      INSERT INTO INSC_EMAIL_TOKEN_L
        (TOKEN_ID, USER_ID, TOKEN, IS_USED)
      VALUES (
        ${tokenId},
        ${userId},
        ${token},
        FALSE
      )
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async getEmailToken(userId: string) {
    const query = SQL`
      SELECT
        TOKEN_ID as tokenId,
        USER_ID as userId,
        TOKEN as token,
        IS_USED as isUsed,
        CREA_DT as createdAt,
      FROM INSC_EMAIL_TOKEN_L
      WHERE USER_ID = ${userId}
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);
    return row;
  }

  async disableToken(token: string) {
    const query = SQL`
      UPDATE INSC_EMAIL_TOKEN_L
      SET IS_USED = TRUE
      WHERE TOKEN = ${token}
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async getUserByEmailToken(token: string) {
    const query = SQL`
    SELECT 
      u.USER_ID     AS userId,
      u.USERNAME    AS username,
      u.FIRST_NM    AS firstName,
      u.LAST_NM     AS lastName,
      u.EMAIL       AS email,
      u.IS_VERIFIED AS isVerified,
      u.CREA_DT     AS createdAt
    FROM INSC_EMAIL_TOKEN_L t
    JOIN INSC_USER_L u ON t.USER_ID = u.USER_ID
    WHERE t.TOKEN = ${token}
      AND t.CREA_DT >= NOW() - INTERVAL 10 MINUTE
      AND NOT t.IS_USED;
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);
    return row;
  }

  async getUserById(userId: string) {
    const query = SQL`
      SELECT 
        u.USERNAME AS username,
        u.FIRST_NM AS firstName,
        u.LAST_NM AS lastName,
        u.EMAIL AS email,
        p.TITLE AS plan 
      FROM INSC_USER_L u
      LEFT JOIN INSC_PLANS_M p ON p.PLAN_ID = u.PLAN_ID
      WHERE USER_ID = ${userId}
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);
    return row;
  }
}
