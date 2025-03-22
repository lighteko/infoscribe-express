import { Express } from "express";
import * as bridge from "@aws-sdk/client-eventbridge";

interface EventBridgeConfig {
  AWS_REGION: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_EVENT_BUS_NAME: string;
  AWS_LAMBDA_ARN: string;
}

class EventBridge {
  private static config: EventBridgeConfig = {
    AWS_REGION: "",
    AWS_ACCESS_KEY: "",
    AWS_SECRET_KEY: "",
    AWS_EVENT_BUS_NAME: "",
    AWS_LAMBDA_ARN: "",
  };

  public static initApp(app: Express): void {
    const {
      AWS_REGION,
      AWS_ACCESS_KEY,
      AWS_SECRET_KEY,
      AWS_EVENT_BUS_NAME,
      AWS_LAMBDA_ARN,
    } = app.get("config");
    EventBridge.config.AWS_REGION = AWS_REGION;
    EventBridge.config.AWS_ACCESS_KEY = AWS_ACCESS_KEY;
    EventBridge.config.AWS_SECRET_KEY = AWS_SECRET_KEY;
    EventBridge.config.AWS_EVENT_BUS_NAME = AWS_EVENT_BUS_NAME;
    EventBridge.config.AWS_LAMBDA_ARN = AWS_LAMBDA_ARN;
  }

  private static initialized = false;
  private _client: bridge.EventBridgeClient | null = null;

  constructor() {}

  private get client(): bridge.EventBridgeClient {
    if (!EventBridge.initialized) {
      throw new Error(
        "EventBridge not initialized. Call EventBridge.initApp() first"
      );
    }

    if (!this._client) {
      this._client = new bridge.EventBridgeClient({
        region: EventBridge.config.AWS_REGION,
        credentials: {
          accessKeyId: EventBridge.config.AWS_ACCESS_KEY,
          secretAccessKey: EventBridge.config.AWS_SECRET_KEY,
        },
      });
    }

    return this._client;
  }

  public async putRule(
    name: string,
    cron: string | null,
    state: bridge.RuleState,
    payload: object,
    eventPattern: object | null = null
  ): Promise<void> {
    const existingRule = await this.client.send(
      new bridge.ListRulesCommand({
        EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
      })
    );

    const ruleExists = existingRule.Rules?.some((rule) => rule.Name === name);
    if (ruleExists) {
      console.log(`Rule ${name} already exists. Skipping creation.`);
      return;
    }

    const ruleParams: bridge.PutRuleCommandInput = {
      Name: name,
      State: state,
      EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
    };

    if (cron) {
      ruleParams.ScheduleExpression = cron;
    } else if (eventPattern) {
      ruleParams.EventPattern = JSON.stringify(eventPattern);
    } else {
      throw new Error(
        "Either cron expression or event pattern must be provided."
      );
    }

    await this.client.send(new bridge.PutRuleCommand(ruleParams));

    const targetId = `target-${name}`;

    await this.client.send(
      new bridge.PutTargetsCommand({
        Rule: name,
        EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
        Targets: [
          {
            Id: targetId,
            Arn: EventBridge.config.AWS_LAMBDA_ARN,
            Input: JSON.stringify(payload),
          },
        ],
      })
    );
  }

  public async deleteRule(name: string): Promise<void> {
    const listTargetsParams: bridge.ListTargetsByRuleCommandInput = {
      Rule: name,
      EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
    };

    const targetData: bridge.ListTargetsByRuleCommandOutput =
      await this.client.send(
        new bridge.ListTargetsByRuleCommand(listTargetsParams)
      );

    const targetIds = targetData.Targets?.map((target) => target.Id) || [];

    if (targetIds.length > 0) {
      const removeParams: bridge.RemoveTargetsCommandInput = {
        Rule: name,
        EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
        Ids: targetIds as string[],
      };

      await this.client.send(new bridge.RemoveTargetsCommand(removeParams));
    }

    const params: bridge.DeleteRuleCommandInput = {
      Name: name,
      EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
    };

    await this.client.send(new bridge.DeleteRuleCommand(params));
  }

  public async sendEvent(detailType: string, detail: object): Promise<void> {
    const params: bridge.PutEventsCommandInput = {
      Entries: [
        {
          EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
          Source: "custom.express",
          DetailType: detailType,
          Detail: JSON.stringify(detail),
        },
      ],
    };

    await this.client.send(new bridge.PutEventsCommand(params));
  }
}

export default EventBridge;
