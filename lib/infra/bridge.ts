import { Express } from "express";
import {
  DeleteRuleCommand,
  DeleteRuleCommandInput,
  EventBridgeClient,
  ListRulesCommand,
  ListTargetsByRuleCommand,
  ListTargetsByRuleCommandInput,
  ListTargetsByRuleCommandOutput,
  PutEventsCommand,
  PutEventsCommandInput,
  PutRuleCommand,
  PutRuleCommandInput,
  PutTargetsCommand,
  RemoveTargetsCommand,
  RemoveTargetsCommandInput,
  RuleState,
} from "@aws-sdk/client-eventbridge";

interface EventBridgeConfig {
  AWS_REGION: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_EVENT_BUS_NAME: string;
  AWS_SQS_ARN: string;
}

class EventBridge {
  private static config: EventBridgeConfig = {
    AWS_REGION: "",
    AWS_ACCESS_KEY: "",
    AWS_SECRET_KEY: "",
    AWS_EVENT_BUS_NAME: "",
    AWS_SQS_ARN: "",
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
    const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_EVENT_BUS_NAME, AWS_SQS_ARN } =
      app.get("config");
    EventBridge.config.AWS_REGION = AWS_REGION;
    EventBridge.config.AWS_ACCESS_KEY = AWS_ACCESS_KEY;
    EventBridge.config.AWS_SECRET_KEY = AWS_SECRET_KEY;
    EventBridge.config.AWS_EVENT_BUS_NAME = AWS_EVENT_BUS_NAME;
    EventBridge.config.AWS_SQS_ARN = AWS_SQS_ARN;
  }

  public async putRule(
    name: string,
    cron: string | null,
    state: RuleState,
    payload: object,
    eventPattern: object | null = null
  ): Promise<void> {
    const existingRule = await this.client.send(
      new ListRulesCommand({
        EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
      })
    );

    const ruleExists = existingRule.Rules?.some((rule) => rule.Name === name);
    if (ruleExists) {
      console.log(`Rule ${name} already exists. Skipping creation.`);
      return;
    }

    const ruleParams: PutRuleCommandInput = {
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

    await this.client.send(new PutRuleCommand(ruleParams));

    const targetId = `target-${name}`;

    await this.client.send(
      new PutTargetsCommand({
        Rule: name,
        EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
        Targets: [
          {
            Id: targetId,
            Arn: EventBridge.config.AWS_SQS_ARN,
            Input: JSON.stringify(payload),
          },
        ],
      })
    );
  }

  public async deleteRule(name: string): Promise<void> {
    const listTargetsParams: ListTargetsByRuleCommandInput = {
      Rule: name,
      EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
    };

    const targetData: ListTargetsByRuleCommandOutput = await this.client.send(
      new ListTargetsByRuleCommand(listTargetsParams)
    );

    const targetIds = targetData.Targets?.map((target) => target.Id) || [];

    if (targetIds.length > 0) {
      const removeParams: RemoveTargetsCommandInput = {
        Rule: name,
        EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
        Ids: targetIds as string[],
      };

      await this.client.send(new RemoveTargetsCommand(removeParams));
    }

    const params: DeleteRuleCommandInput = {
      Name: name,
      EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
    };

    await this.client.send(new DeleteRuleCommand(params));
  }

  public async sendEvent(detailType: string, detail: object): Promise<void> {
    const params: PutEventsCommandInput = {
      Entries: [
        {
          EventBusName: EventBridge.config.AWS_EVENT_BUS_NAME,
          Source: "custom.express",
          DetailType: detailType,
          Detail: JSON.stringify(detail),
        },
      ],
    };
    
    await this.client.send(new PutEventsCommand(params));
  }
}

export default EventBridge;
