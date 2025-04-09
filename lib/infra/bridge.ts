import { Express } from "express";
import * as scheduler from "@aws-sdk/client-scheduler";

interface EventBridgeConfig {
  AWS_REGION: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_LAMBDA_ARN: string;
  AWS_SCHEDULER_ROLE_ARN: string;
}

class EventBridge {
  private static instance: EventBridge | null = null;
  private static config: EventBridgeConfig = {
    AWS_REGION: "",
    AWS_ACCESS_KEY: "",
    AWS_SECRET_KEY: "",
    AWS_LAMBDA_ARN: "",
    AWS_SCHEDULER_ROLE_ARN: "",
  };
  private static initialized = false;
  private _client: scheduler.SchedulerClient | null = null;

  public static initApp(app: Express): void {
    const {
      AWS_REGION,
      AWS_ACCESS_KEY,
      AWS_SECRET_KEY,
      AWS_LAMBDA_ARN,
      AWS_SCHEDULER_ROLE_ARN,
    } = app.get("config");

    EventBridge.config.AWS_REGION = AWS_REGION;
    EventBridge.config.AWS_ACCESS_KEY = AWS_ACCESS_KEY;
    EventBridge.config.AWS_SECRET_KEY = AWS_SECRET_KEY;
    EventBridge.config.AWS_LAMBDA_ARN = AWS_LAMBDA_ARN;
    EventBridge.config.AWS_SCHEDULER_ROLE_ARN = AWS_SCHEDULER_ROLE_ARN;

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

  private get scheduler(): scheduler.SchedulerClient {
    if (!EventBridge.initialized) {
      throw new Error(
        "EventBridge not initialized. Call EventBridge.initApp() first"
      );
    }

    if (!this._client) {
      this._client = new scheduler.SchedulerClient({
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
    flexibleTimeWindow: scheduler.FlexibleTimeWindow = { Mode: "OFF" },
    startDate?: Date,
    endDate?: Date
  ): Promise<void> {
    const scheduleParams: scheduler.CreateScheduleCommandInput = {
      Name: name,
      ScheduleExpression: scheduleExpression,
      FlexibleTimeWindow: flexibleTimeWindow,
      Target: {
        Arn: EventBridge.config.AWS_LAMBDA_ARN,
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

    await this.scheduler.send(new scheduler.CreateScheduleCommand(scheduleParams));
  }

  public async updateSchedule(
    name: string,
    scheduleExpression: string,
    payload: object,
    flexibleTimeWindow: scheduler.FlexibleTimeWindow = { Mode: "OFF" },
    startDate?: Date,
    endDate?: Date
  ): Promise<void> {
    const scheduleParams: scheduler.UpdateScheduleCommandInput = {
      Name: name,
      ScheduleExpression: scheduleExpression,
      FlexibleTimeWindow: flexibleTimeWindow,
      Target: {
        Arn: EventBridge.config.AWS_LAMBDA_ARN,
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

    await this.scheduler.send(new scheduler.UpdateScheduleCommand(scheduleParams));
  }

  public async deleteSchedule(name: string): Promise<void> {
    const params: scheduler.DeleteScheduleCommandInput = {
      Name: name,
    };

    await this.scheduler.send(new scheduler.DeleteScheduleCommand(params));
  }

  public async getSchedule(name: string): Promise<scheduler.GetScheduleCommandOutput> {
    const params: scheduler.GetScheduleCommandInput = {
      Name: name,
    };

    return await this.scheduler.send(new scheduler.GetScheduleCommand(params));
  }

  public async listSchedules(
    groupName?: string,
    namePrefix?: string
  ): Promise<scheduler.ListSchedulesCommandOutput> {
    const params: scheduler.ListSchedulesCommandInput = {
      GroupName: groupName,
      NamePrefix: namePrefix,
    };

    return await this.scheduler.send(new scheduler.ListSchedulesCommand(params));
  }
}

export default EventBridge;
