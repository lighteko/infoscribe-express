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
    const query = SQL`
      INSERT INTO INSC_USER_L
        (USER_ID, USERNAME, FIRST_NM, LAST_NM, PASSWRD, EMAIL, CREA_DT)
      VALUES (
        ${uuid4().toString()}, 
        ${inputData.username}, 
        ${inputData.firstName}, 
        ${inputData.lastName},
        ${inputData.password},
        ${inputData.email},
        CURRENT_TIMESTAMP
      )
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
}
