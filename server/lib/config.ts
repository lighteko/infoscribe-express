import dotenv from "dotenv";
import { Express } from "express";

dotenv.config();

export class BaseConfig {
  static LOGGING_PATH = "../logs";

  static MYSQL_HOST = process.env.MYSQL_HOST || "db host";
  static MYSQL_USER = process.env.MYSQL_USER || "db user";
  static MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "db password";
  static MYSQL_DB = process.env.MYSQL_DB || "db database";
  static MYSQL_PORT = process.env.MYSQL_PORT || "db port";
  static MYSQL_POOL_SIZE = parseInt(process.env.MYSQL_POOL_SIZE || "5", 10);

  constructor(app: Express) {
    BaseConfig.initApp(app);
  }

  static initApp(app: Express): void {
    app.set("config", {
      MYSQL_HOST: this.MYSQL_HOST,
      MYSQL_USER: this.MYSQL_USER,
      MYSQL_PASSWORD: this.MYSQL_PASSWORD,
      MYSQL_DB: this.MYSQL_DB,
      MYSQL_PORT: this.MYSQL_PORT,
      MYSQL_POOL_SIZE: this.MYSQL_POOL_SIZE,
    });

    console.log("App configuration initialized.");
  }
}
