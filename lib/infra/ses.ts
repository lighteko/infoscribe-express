import { Express } from "express";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

interface SESConfig {
  AWS_REGION: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  SES_FROM_ADDRESS: string;
}

class SES {
  client: SESClient;

  constructor() {
    this.client = new SESClient({
      region: SES.config.AWS_REGION,
      credentials: {
        accessKeyId: SES.config.AWS_ACCESS_KEY,
        secretAccessKey: SES.config.AWS_SECRET_KEY,
      },
    });
  }

  private static config: SESConfig = {
    AWS_REGION: "",
    AWS_ACCESS_KEY: "",
    AWS_SECRET_KEY: "",
    SES_FROM_ADDRESS: "",
  };

  public static initApp(app: Express): void {
    const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, SES_FROM_ADDRESS } =
      app.get("config");
    SES.config.AWS_REGION = AWS_REGION;
    SES.config.AWS_ACCESS_KEY = AWS_ACCESS_KEY;
    SES.config.AWS_SECRET_KEY = AWS_SECRET_KEY;
    SES.config.SES_FROM_ADDRESS = SES_FROM_ADDRESS;
  }

  public async sendEmail(
    to: string,
    subject: string,
    htmlBody: string
  ): Promise<void> {
    const params = {
      Source: SES.config.SES_FROM_ADDRESS,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: htmlBody } },
      },
    };

    const command = new SendEmailCommand(params);
    await this.client.send(command);
  }
}

export default SES;
