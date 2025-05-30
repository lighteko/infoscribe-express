import dotenv from "dotenv";
import { Express } from "express";

dotenv.config();

export class BaseConfig {
  static LOGGING_PATH = "../logs";

  static AWS_REGION = process.env.AWS_REGION || "";
  static AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || "";
  static AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || "";
  static AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";
  static AWS_EVENT_BUS_ARN = process.env.AWS_EVENT_BUS_ARN || "";
  static AWS_SQS_ARN = process.env.AWS_SQS_ARN || "";
  static SES_FROM_ADDRESS = process.env.SES_FROM_ADDRESS || "";
  static AWS_SCHEDULER_ROLE_ARN = process.env.AWS_SCHEDULER_ROLE_ARN || "";
  static AWS_SCHEDULER_GROUP_NAME = process.env.AWS_SCHEDULER_GROUP_NAME || "";

  static MYSQL_HOST = process.env.MYSQL_HOST || "db host";
  static MYSQL_USER = process.env.MYSQL_USER || "db user";
  static MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "db password";
  static MYSQL_DB = process.env.MYSQL_DB || "db database";
  static MYSQL_PORT = process.env.MYSQL_PORT || "db port";
  static MYSQL_POOL_SIZE = parseInt(process.env.MYSQL_POOL_SIZE || "5", 10);

  static JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "";
  static JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
  static JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "";
  static JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "";
  static EMAIL_VERIFICATION_SECRET =
    process.env.EMAIL_VERIFICATION_SECRET || "";

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
      AWS_EVENT_BUS_ARN: this.AWS_EVENT_BUS_ARN,
      AWS_SQS_ARN: this.AWS_SQS_ARN,
      AWS_SCHEDULER_ROLE_ARN: this.AWS_SCHEDULER_ROLE_ARN,
      AWS_SCHEDULER_GROUP_NAME: this.AWS_SCHEDULER_GROUP_NAME,
      SES_FROM_ADDRESS: this.SES_FROM_ADDRESS,
      JWT_ACCESS_SECRET: this.JWT_ACCESS_SECRET,
      JWT_REFRESH_SECRET: this.JWT_REFRESH_SECRET,
      JWT_ACCESS_EXPIRY: this.JWT_ACCESS_EXPIRY,
      JWT_REFRESH_EXPIRY: this.JWT_REFRESH_EXPIRY,
      EMAIL_VERIFICATION_SECRET: this.EMAIL_VERIFICATION_SECRET,
    });

    console.log("App configuration initialized.");
  }
}
