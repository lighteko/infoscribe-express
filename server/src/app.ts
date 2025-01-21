import express, { Request, Response, NextFunction, Application } from "express";
import { BaseConfig } from "../config";
import DB from "@lib/infra/mysql";
import cors from "cors";
import winston from "winston";

const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    label({ label: "Express" }),
    logFormat
  ),
  transports: [new winston.transports.Console()],
});

function createApp() {
  const app = express();
  new BaseConfig(app);
  DB.initApp(app);
  app.use(express.json());
  app.use(cors());

  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug(`Request Path: ${req.path}`);
    logger.debug(`Request Method: ${req.method}`);
    logger.debug(`Request Headers: ${JSON.stringify(req.headers, null, 2)}`);
    logger.debug(`Request Data: ${JSON.stringify(req.body, null, 2)}`);
    next();
  });

  app.use((_req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    res.send = (body: any) => {
      logger.debug(`Response Status Code: ${res.statusCode}`);
      logger.debug(
        `Response Headers: ${JSON.stringify(res.getHeaders(), null, 2)}`
      );
      try {
        const parsedBody = JSON.parse(body);
        logger.debug(`Response Data: ${JSON.stringify(parsedBody, null, 2)}`);
      } catch {
        logger.debug(`Response Data: ${body}`);
      }
      return originalSend.call(res, body);
    };
    next();
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).send({
      health: "healthy",
    });
  });

  registerRoutes(app);

  return app;
}

function registerRoutes(app: Application) {}

export default createApp;
