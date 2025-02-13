import dotenv from "dotenv";
import { Express } from "express";

dotenv.config();

export class BaseConfig {
  static LOGGING_PATH = "../logs";

  static AWS_REGION = process.env.AWS_REGION || "";
  static AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || "";
  static AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || "";
  static AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";
  static AWS_EVENT_BUS_NAME = process.env.AWS_EVENT_BUS_NAME || "";
  static AWS_LAMBDA_ARN = process.env.AWS_LAMBDA_ARN || "";

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
      AWS_REGION: this.AWS_REGION,
      AWS_ACCESS_KEY: this.AWS_ACCESS_KEY,
      AWS_SECRET_KEY: this.AWS_SECRET_KEY,
      AWS_BUCKET_NAME: this.AWS_BUCKET_NAME,
      AWS_EVENT_BUS_NAME: this.AWS_EVENT_BUS_NAME,
      AWS_LAMBDA_ARN: this.AWS_LAMBDA_ARN,
    });

    console.log("App configuration initialized.");
  }
}
