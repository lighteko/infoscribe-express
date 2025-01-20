import { Application } from "express";
import { createPool, Pool, PoolConnection } from "mysql2/promise";
import * as sqlFormatter from "sql-formatter";

// Logger setup
import * as winston from "winston";

const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

interface DBConfig {
  MYSQL_HOST: string;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  MYSQL_DB: string;
  MYSQL_POOL_SIZE: number;
}

class DB {
  private static config: DBConfig = {
    MYSQL_HOST: "127.0.0.1",
    MYSQL_USER: "root",
    MYSQL_PASSWORD: "1234",
    MYSQL_DB: "template",
    MYSQL_POOL_SIZE: 10,
  };

  private static connectionPool: Pool | null = null;

  private constructor() {}

  public static initApp(app: Application): void {
    DB.config.MYSQL_HOST = app.get("MYSQL_HOST");
    DB.config.MYSQL_USER = app.get("MYSQL_USER");
    DB.config.MYSQL_PASSWORD = app.get("MYSQL_PASSWORD");
    DB.config.MYSQL_DB = app.get("MYSQL_DB");
    DB.config.MYSQL_POOL_SIZE = app.get("MYSQL_POOL_SIZE");

    if (!DB.connectionPool) {
      DB.connectionPool = createPool({
        host: DB.config.MYSQL_HOST,
        user: DB.config.MYSQL_USER,
        password: DB.config.MYSQL_PASSWORD,
        database: DB.config.MYSQL_DB,
        waitForConnections: true,
        connectionLimit: DB.config.MYSQL_POOL_SIZE,
        queueLimit: 0,
      });
    }
  }

  public static async withConnection<T>(
    callback: (connection: PoolConnection) => Promise<T>
  ): Promise<T> {
    if (!DB.connectionPool) {
      throw new Error("Connection pool is not initialized. Call initApp first.");
    }

    const connection = await DB.connectionPool.getConnection();

    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      logger.error(sqlFormatter.format(connection.format(error.sql ?? "")));
      logger.error(error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default DB;