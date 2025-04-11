import { Express } from "express";
import * as clientScheduler from "@aws-sdk/client-scheduler";

interface EventBridgeConfig {
  AWS_REGION: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_SQS_ARN: string;
  AWS_SCHEDULER_ROLE_ARN: string;
  AWS_SCHEDULER_GROUP_NAME: string;
}

class EventBridge {
  private static instance: EventBridge | null = null;
  private static config: EventBridgeConfig = {
    AWS_REGION: "",
    AWS_ACCESS_KEY: "",
    AWS_SECRET_KEY: "",
    AWS_SQS_ARN: "",
    AWS_SCHEDULER_ROLE_ARN: "",
    AWS_SCHEDULER_GROUP_NAME: "",
  };
  private static initialized = false;
  private _client: clientScheduler.SchedulerClient | null = null;

  public static initApp(app: Express): void {
    const {
      AWS_REGION,
      AWS_ACCESS_KEY,
      AWS_SECRET_KEY,
      AWS_SQS_ARN,
      AWS_SCHEDULER_ROLE_ARN,
      AWS_SCHEDULER_GROUP_NAME,
    } = app.get("config");

    EventBridge.config.AWS_REGION = AWS_REGION;
    EventBridge.config.AWS_ACCESS_KEY = AWS_ACCESS_KEY;
    EventBridge.config.AWS_SECRET_KEY = AWS_SECRET_KEY;
    EventBridge.config.AWS_SQS_ARN = AWS_SQS_ARN;
    EventBridge.config.AWS_SCHEDULER_ROLE_ARN = AWS_SCHEDULER_ROLE_ARN;
    EventBridge.config.AWS_SCHEDULER_GROUP_NAME = AWS_SCHEDULER_GROUP_NAME;

    EventBridge.initialized = true;
  }

  public static getInstance(): EventBridge {
    if (!EventBridge.initialized) {
      throw new Error(
        "EventBridge not initialized. Call EventBridge.initApp() first"
      );
    }

    if (!EventBridge.instance) {
      EventBridge.instance = new EventBridge();
    }

    return EventBridge.instance;
  }

  private constructor() {}

  private get scheduler(): clientScheduler.SchedulerClient {
    if (!EventBridge.initialized) {
      throw new Error(
        "EventBridge not initialized. Call EventBridge.initApp() first"
      );
    }

    if (!this._client) {
      this._client = new clientScheduler.SchedulerClient({
        region: EventBridge.config.AWS_REGION,
        credentials: {
          accessKeyId: EventBridge.config.AWS_ACCESS_KEY,
          secretAccessKey: EventBridge.config.AWS_SECRET_KEY,
        },
      });
    }

    return this._client;
  }

  public async createSchedule(
    name: string,
    scheduleExpression: string,
    payload: object,
    flexibleTimeWindow: clientScheduler.FlexibleTimeWindow = { Mode: "OFF" },
    startDate?: Date,
    endDate?: Date
  ): Promise<void> {
    const scheduleParams: clientScheduler.CreateScheduleCommandInput = {
      Name: name,
      GroupName: EventBridge.config.AWS_SCHEDULER_GROUP_NAME,
      ScheduleExpression: scheduleExpression,
      FlexibleTimeWindow: flexibleTimeWindow,
      Target: {
        Arn: EventBridge.config.AWS_SQS_ARN,
        RoleArn: EventBridge.config.AWS_SCHEDULER_ROLE_ARN,
        Input: JSON.stringify(payload),
        SqsParameters: {
          MessageGroupId: name,
        }
      },
      State: "ENABLED",
    };

    if (startDate) {
      scheduleParams.StartDate = startDate;
    }

    if (endDate) {
      scheduleParams.EndDate = endDate;
    }

    await this.scheduler.send(
      new clientScheduler.CreateScheduleCommand(scheduleParams)
    );
  }

  public async updateSchedule(
    name: string,
    scheduleExpression: string,
    payload: object,
    flexibleTimeWindow: clientScheduler.FlexibleTimeWindow = { Mode: "OFF" },
    startDate?: Date,
    endDate?: Date
  ): Promise<void> {
    const scheduleParams: clientScheduler.UpdateScheduleCommandInput = {
      Name: name,
      GroupName: EventBridge.config.AWS_SCHEDULER_GROUP_NAME,
      ScheduleExpression: scheduleExpression,
      FlexibleTimeWindow: flexibleTimeWindow,
      Target: {
        Arn: EventBridge.config.AWS_SQS_ARN,
        RoleArn: EventBridge.config.AWS_SCHEDULER_ROLE_ARN,
        Input: JSON.stringify(payload),
      },
      State: "ENABLED",
    };

    if (startDate) {
      scheduleParams.StartDate = startDate;
    }

    if (endDate) {
      scheduleParams.EndDate = endDate;
    }

    await this.scheduler.send(
      new clientScheduler.UpdateScheduleCommand(scheduleParams)
    );
  }

  public async deleteSchedule(name: string): Promise<void> {
    const params: clientScheduler.DeleteScheduleCommandInput = {
      Name: name,
    };

    await this.scheduler.send(new clientScheduler.DeleteScheduleCommand(params));
  }

  public async getSchedule(
    name: string
  ): Promise<clientScheduler.GetScheduleCommandOutput> {
    const params: clientScheduler.GetScheduleCommandInput = {
      GroupName: EventBridge.config.AWS_SCHEDULER_GROUP_NAME,
      Name: name,
    };

    return await this.scheduler.send(new clientScheduler.GetScheduleCommand(params));
  }

  public async listSchedules(
    groupName?: string,
    namePrefix?: string
  ): Promise<clientScheduler.ListSchedulesCommandOutput> {
    const params: clientScheduler.ListSchedulesCommandInput = {
      GroupName: groupName,
      NamePrefix: namePrefix,
    };

    return await this.scheduler.send(
      new clientScheduler.ListSchedulesCommand(params)
    );
  }
}

export default EventBridge;
