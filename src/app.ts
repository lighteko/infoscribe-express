import express, { Request, Response, NextFunction } from "express";
import { BaseConfig } from "@lib/config";
import DB from "@lib/infra/mysql";
import S3 from "@lib/infra/s3";
import EventBridge from "@lib/infra/bridge";
import SES from "@lib/infra/ses";
import cors from "cors";
import initLogger from "@src/logger";
import userRoutes from "@user/routes";
import providerRoutes from "@provider/routes";
import letterRoutes from "@letter/routes";
import authRoutes from "@auth/routes";
import { authenticate } from "@src/middlewares/authentication";

function createApp() {
  const app = express();
  
  new BaseConfig(app);
  DB.initApp(app);
  S3.initApp(app);
  EventBridge.initApp(app);
  SES.initApp(app);

  app.use(express.json());
  app.use(cors());
  const logger = initLogger("debug");

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

  // Public routes
  app.use("/auth", authRoutes);

  // Protected routes
  app.use("/user", authenticate, userRoutes);
  app.use("/provider", authenticate, providerRoutes);
  app.use("/letter", authenticate, letterRoutes);

  return app;
}

export default createApp;
