import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import { CreateUserRequestDTO, UpdateUserRequestDTO } from "@user/dto/dto";
import { v4 as uuid4 } from "uuid";

export class UserDAO {
  db: DB;
  constructor() {
    this.db = new DB();
  }

  async createUser(inputData: CreateUserRequestDTO) {
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
    const cursor = await this.db.cursor();
    await cursor.execute(query);
  }

  async getUser(userId: string) {
    const query = SQL`
      SELECT
        USER_ID as userId,
        USERNAME as username,
        FIRST_NM as firstName,
        LAST_NM as lastName,
        EMAIL as email
      FROM INSC_USER_L
      WHERE USER_ID = ${userId}
    `;

    const cursor = await this.db.cursor();
    const row = await cursor.fetchOne(query);

    return row;
  }

  async updateUser(inputData: UpdateUserRequestDTO) {
    const query = SQL`
    UPDATE INSC_USER_L
    SET USERNAME = ${inputData.username},
        FIRST_NM = ${inputData.firstName},
        LAST_NM = ${inputData.lastName},
        PASSWRD = ${inputData.password},
        EMAIL = ${inputData.email}
    WHERE USER_ID = ${inputData.userId}
    `;

    const cursor = await this.db.cursor();
    await cursor.execute(query);
  }
}
