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

  async killProviderRoutine(providerId: string) {
    await this.bridge.deleteSchedule(`${providerId}-collect`);
    await this.bridge.deleteSchedule(`${providerId}-build`);
  }

  private calculateStartDate(schedule: string): Date {
    const cronBody = schedule.replace(/^cron\(|\)$/g, "");
    const [minute, hour, , , dayOfWeekStr] = cronBody.trim().split(/\s+/);

    const now = new Date();
    const currentDay = now.getDay();
    const targetDay = parseInt(dayOfWeekStr);

    let daysUntilTarget = (targetDay - currentDay + 7) % 7;
    if (daysUntilTarget === 0) {
      daysUntilTarget = 7;
    }

    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysUntilTarget);
    nextDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

    const startDate = new Date(nextDate);
    startDate.setDate(nextDate.getDate() + 7);

    return startDate;
  }

  private create2DayIntervalCron(schedule: string): string {
    const cronBody = schedule.replace(/^cron\(|\)$/g, "");
    const [minute, hour, , month, dayOfWeekStr] = cronBody.trim().split(/\s+/);

    const dayOfWeeks = dayOfWeekStr.split(",").map((d) => {
      const n = parseInt(d, 10);
      return n === 7 ? 0 : n;
    });

    const baseDay = dayOfWeeks[0];
    const intervals = [0, 2, 4].map((offset) => (baseDay + offset) % 7);
    const newDayOfWeek = intervals.join(",");

    const newCron = `cron(${minute} ${hour} ? ${month} ${newDayOfWeek} *)`;
    return newCron;
  }
}
