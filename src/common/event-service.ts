import EventBridge from "@lib/infra/bridge";
import { ProviderRoutineDTO } from "@provider/dto/dto";

export class EventService {
  bridge: EventBridge;

  constructor() {
    this.bridge = EventBridge.getInstance();
  }

  async publishProviderRoutine(inputData: ProviderRoutineDTO) {
    const { providerId, tags, locale, schedule } = inputData;

    const buildStartDate = this.calculateStartDate(schedule);
    const collectStartDate = new Date(buildStartDate);
    collectStartDate.setDate(buildStartDate.getDate() - 7);

    await this.bridge.createSchedule(
      `${providerId}-collect`,
      this.create2DayIntervalCron(schedule),
      {
        eventType: "collect",
        providerId,
        tags,
        locale,
      },
      { Mode: "OFF" },
      collectStartDate
    );

    await this.bridge.createSchedule(
      `${providerId}-build`,
      schedule,
      {
        eventType: "build",
        providerId,
        tags,
        locale,
      },
      { Mode: "OFF" },
      buildStartDate
    );
  }

  async updateProviderRoutine(inputData: ProviderRoutineDTO) {
    await this.killProviderRoutine(inputData.providerId);
    await this.publishProviderRoutine(inputData);
  }

  async killProviderRoutine(providerId: string) {
    await this.bridge.deleteSchedule(`${providerId}-collect`);
    await this.bridge.deleteSchedule(`${providerId}-build`);
  }

  private calculateStartDate(schedule: string): Date {
    const cronBody = schedule.replace(/^cron\(|\)$/g, "");
    const [minute, hour, , , dayOfWeekStr] = cronBody.trim().split(/\s+/);

    const now = new Date();
    const currentUTCDay = now.getUTCDay();
    const targetDay = parseInt(dayOfWeekStr);

    const daysUntilTarget = (targetDay - currentUTCDay + 6) % 7;

    const startDate = new Date(now);
    startDate.setUTCDate(now.getUTCDate() + daysUntilTarget + 7);
    startDate.setUTCHours(parseInt(hour), parseInt(minute), 0, 0);

    return startDate;
  }

  private create2DayIntervalCron(schedule: string): string {
    const cronBody = schedule.replace(/^cron\(|\)$/g, "");
    const [minute, hour, , month, dayOfWeekStr] = cronBody.trim().split(/\s+/);

    const baseDay = parseInt(dayOfWeekStr);

    const indexes = [2, 4, 6].map((offset) =>
      (baseDay + offset) % 7 == 0 ? 7 : (baseDay + offset) % 7
    );
    const weekdays = ["", "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const newDayOfWeek = indexes.map((i) => weekdays[i]).join(",");

    const newCron = `cron(${minute} ${hour} ? ${month} ${newDayOfWeek} *)`;
    return newCron;
  }
}
