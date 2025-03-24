import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import { v4 as uuid4 } from "uuid";
import { SignUpRequestDTO } from "../dto/dto";

export class AuthDAO {
  db: DB;
  constructor() {
    this.db = new DB();
  }

  async createUser(inputData: SignUpRequestDTO) {
    const userId = uuid4().toString();
    const query = SQL`
      INSERT INTO INSC_USER_L
        (USER_ID, USERNAME, FIRST_NM, LAST_NM, PASSWRD, EMAIL, IS_VERIFIED, CREA_DT)
      VALUES (
        ${userId}, 
        ${inputData.username}, 
        ${inputData.firstName}, 
        ${inputData.lastName},
        ${inputData.password},
        ${inputData.email},
        FALSE,
        CURRENT_TIMESTAMP
      )
    `;
    const cursor = this.db.cursor();
    await cursor.execute(query);
    return userId;
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
        PASSWRD AS pwd
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
        (TOKEN_ID, USER_ID, TOKEN, CREA_DT)
      VALUES (
        ${tokenId},
        ${userId},
        ${refreshToken},
        CURRENT_TIMESTAMP
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

  async saveEmailVerificationToken(userId: string, token: string) {
    const tokenId = uuid4().toString();
    const query = SQL`
      INSERT INTO INSC_EMAIL_TOKEN_L
        (TOKEN_ID, USER_ID, TOKEN, CREA_DT)
      VALUES (
        ${tokenId},
        ${userId},
        ${token},
        CURRENT_TIMESTAMP
      )
    `;

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }

  async getEmailVerificationToken(userId: string) {
    const query = SQL`
      SELECT
        TOKEN_ID as tokenId,
        USER_ID as userId,
        TOKEN as token,
        CREA_DT as createdAt
        UPDT_DT as updatedAt
      FROM INSC_EMAIL_TOKEN_L
      WHERE USER_ID = ${userId}
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);
    return row;
  }

  async replaceEmailVerificationToken(tokenId: string, token: string) {
    const query = SQL`
      UPDATE INSC_EMAIL_TOKEN_L
      SET TOKEN = ${token}, 
          UPDT_DT = CURRENT_TIMESTAMP
      WHERE TOKEN_ID = ${tokenId}
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
      AND TIMESTAMPDIFF(MINUTE, GREATEST(t.CREA_DT, COALESCE(t.UPDT_DT, t.CREA_DT)), NOW()) <= 10
    `;

    const cursor = this.db.cursor();
    const row = await cursor.fetchOne(query);
    return row;
  }
}
