import DB from "@lib/infra/mysql";
import SQL from "sql-template-strings";
import { UpdateUserRequestDTO } from "@user/dto/dto";

export class UserDAO {
  db: DB;
  constructor() {
    this.db = DB.getInstance();
  }

  async getUser(userId: string) {
    const query = SQL`
      SELECT
        USER_ID AS userId,
        USERNAME AS username,
        FIRST_NM AS firstName,
        LAST_NM AS lastName,
        EMAIL AS email
      FROM INSC_USER_L
      WHERE USER_ID = ${userId}
    `;

    const cursor = this.db.cursor();
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

    const cursor = this.db.cursor();
    await cursor.execute(query);
  }
}
