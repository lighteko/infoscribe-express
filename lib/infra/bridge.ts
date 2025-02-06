import { Express } from "express";
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";

interface EventBridgeConfig {
  AWS_REGION: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  EVENT_BUS_NAME: string;
}

class EventBridge {
  private static config: EventBridgeConfig = {
    AWS_REGION: "",
    AWS_ACCESS_KEY: "",
    AWS_SECRET_KEY: "",
    EVENT_BUS_NAME: "",
  };

  private client: EventBridgeClient;

  constructor() {
    this.client = new EventBridgeClient({
      region: EventBridge.config.AWS_REGION,
      credentials: {
        accessKeyId: EventBridge.config.AWS_ACCESS_KEY,
        secretAccessKey: EventBridge.config.AWS_SECRET_KEY,
      },
    });
  }

  public static initApp(app: Express): void {
    const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, EVENT_BUS_NAME } =
      app.get("config");
    EventBridge.config.AWS_REGION = AWS_REGION;
    EventBridge.config.AWS_ACCESS_KEY = AWS_ACCESS_KEY;
    EventBridge.config.AWS_SECRET_KEY = AWS_SECRET_KEY;
    EventBridge.config.EVENT_BUS_NAME = EVENT_BUS_NAME;
  }

  public async publishEvent(
    detailType: string,
    source: string,
    detail: object
  ): Promise<void> {
    const params: PutEventsCommandInput = {
      Entries: [
        {
          EventBusName: EventBridge.config.EVENT_BUS_NAME,
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(detail),
        },
      ],
    };

    await this.client.send(new PutEventsCommand(params));
  }
}

export default EventBridge;
