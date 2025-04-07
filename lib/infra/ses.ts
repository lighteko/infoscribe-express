import { Express } from "express";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface SESConfig {
  AWS_REGION: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  SES_FROM_ADDRESS: string;
}

class SES {
  private static instance: SES | null = null;
  private static config: SESConfig = {
    AWS_REGION: "",
    AWS_ACCESS_KEY: "",
    AWS_SECRET_KEY: "",
    SES_FROM_ADDRESS: "",
  };
  private static initialized = false;
  private _client: SESClient | null = null;

  public static initApp(app: Express): void {
    const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, SES_FROM_ADDRESS } =
      app.get("config");

    SES.config.AWS_REGION = AWS_REGION;
    SES.config.AWS_ACCESS_KEY = AWS_ACCESS_KEY;
    SES.config.AWS_SECRET_KEY = AWS_SECRET_KEY;
    SES.config.SES_FROM_ADDRESS = SES_FROM_ADDRESS;

    SES.initialized = true;
  }

  public static getInstance(): SES {
    if (!SES.initialized) {
      throw new Error("SES not initialized. Call SES.initApp() first");
    }
    if (!SES.instance) {
      SES.instance = new SES();
    }

    return SES.instance;
  }

  private constructor() {}

  private get client(): SESClient {
    if (!SES.initialized) {
      throw new Error("SES not initialized. Call SES.initApp() first");
    }

    if (!this._client) {
      this._client = new SESClient({
        region: SES.config.AWS_REGION,
        credentials: {
          accessKeyId: SES.config.AWS_ACCESS_KEY,
          secretAccessKey: SES.config.AWS_SECRET_KEY,
        },
      });
    }

    return this._client;
  }

  public async sendEmail(
    to: string,
    subject: string,
    htmlBody: string
  ): Promise<void> {
    if (!htmlBody) {
      console.error("Empty HTML body, cannot send email");
      throw new Error("Empty HTML body");
    }

    const htmlContent =
      typeof htmlBody === "string"
        ? htmlBody
        : typeof htmlBody === "object"
        ? JSON.stringify(htmlBody)
        : String(htmlBody);

    const params = {
      Source: `'Infoscribe' <${SES.config.SES_FROM_ADDRESS}>`,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: htmlContent } },
      },
    };

    try {
      const command = new SendEmailCommand(params);
      await this.client.send(command);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  public loadTemplate(filename: string): string {
    const filePath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../public/templates",
      `${filename}.html`
    );
    return fs.readFileSync(filePath, "utf-8");
  }
}

export default SES;
