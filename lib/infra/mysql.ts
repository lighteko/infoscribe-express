import { Express } from "express";
import { createPool, Pool, QueryResult, RowDataPacket } from "mysql2/promise";
import { format } from "sql-formatter";
import initLogger from "@src/logger";
import { SQLStatement } from "sql-template-strings";

const logger = initLogger("error");

interface DBConfig {
  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  MYSQL_DB: string;
  MYSQL_POOL_SIZE: number;
}

class DB {
  constructor() {}
  private static config: DBConfig = {
    MYSQL_HOST: "127.0.0.1",
    MYSQL_PORT: 3306,
    MYSQL_USER: "root",
    MYSQL_PASSWORD: "1234",
    MYSQL_DB: "template",
    MYSQL_POOL_SIZE: 10,
  };

  private static connectionPool: Pool | null = null;

  public static initApp(app: Express): void {
    const {
      MYSQL_HOST,
      MYSQL_USER,
      MYSQL_PASSWORD,
      MYSQL_DB,
      MYSQL_PORT,
      MYSQL_POOL_SIZE,
    } = app.get("config");
    DB.config.MYSQL_HOST = MYSQL_HOST;
    DB.config.MYSQL_PORT = MYSQL_PORT;
    DB.config.MYSQL_USER = MYSQL_USER;
    DB.config.MYSQL_PASSWORD = MYSQL_PASSWORD;
    DB.config.MYSQL_DB = MYSQL_DB;
    DB.config.MYSQL_POOL_SIZE = MYSQL_POOL_SIZE;

    if (!DB.connectionPool) {
      DB.connectionPool = createPool({
        host: DB.config.MYSQL_HOST,
        port: DB.config.MYSQL_PORT,
        user: DB.config.MYSQL_USER,
        password: DB.config.MYSQL_PASSWORD,
        database: DB.config.MYSQL_DB,
        waitForConnections: true,
        connectionLimit: DB.config.MYSQL_POOL_SIZE,
        queueLimit: 0,
      });
    }
  }

  private async executeQuery<T extends QueryResult>(
    statement: SQLStatement,
    isTransactionRequired = false
  ) {
    if (!DB.connectionPool) {
      throw new Error(
        "Connection pool is not initialized. Call initApp first."
      );
    }

    const connection = await DB.connectionPool.getConnection();
    try {
      if (isTransactionRequired) {
        await connection.beginTransaction();
      }

      const [rows] = await connection.query<T>(statement);

      if (isTransactionRequired) {
        await connection.commit();
      }

      return rows;
    } catch (error) {
      if (isTransactionRequired) {
        await connection.rollback();
      }
      logger.error(format(connection.format((error as any).sql ?? "")));
      logger.error(error);
      throw error;
    } finally {
      connection.release();
    }
  }

  public cursor() {
    return {
      fetchAll: async (
        statement: SQLStatement,
        isTransactionRequired = false
      ) => {
        return await this.executeQuery<RowDataPacket[]>(
          statement,
          isTransactionRequired
        );
      },
      fetchOne: async (
        statement: SQLStatement,
        isTransactionRequired = false
      ) => {
        const result = await this.executeQuery<RowDataPacket[]>(
          statement,
          isTransactionRequired
        );
        return result[0] ?? null;
      },
      execute: async (
        statement: SQLStatement,
        isTransactionRequired = false
      ) => {
        await this.executeQuery(statement, isTransactionRequired);
      },
    };
  }
}

export default DB;
