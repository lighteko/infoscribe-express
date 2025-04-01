import EventBridge from "@lib/infra/bridge";
import { ProviderRoutineDTO } from "../dto/dto";

export class EventService {
  bridge: EventBridge;

  constructor() {
    this.bridge = EventBridge.getInstance();
  }

  async publishProviderRoutine(inputData: ProviderRoutineDTO) {
    const { providerId, tags, locale, schedule } = inputData;
    await this.bridge.putRule(
      `${providerId}-collect`,
      this.create2DayIntervalCron(schedule),
      "ENABLED",
      {
        eventType: "collect",
        providerId,
        tags,
        locale,
      }
    );
    await this.bridge.putRule(`${providerId}-build`, schedule, "ENABLED", {
      eventType: "build",
      providerId,
      tags,
      locale,
    });
  }

  async killProviderRoutine(providerId: string) {
    await this.bridge.deleteRule(`${providerId}-collect`);
    await this.bridge.deleteRule(`${providerId}-build`);
  }

  private create2DayIntervalCron(schedule: string): string {
    const parts = schedule.trim().split(/\s+/);
    const [minute, hour, dayOfMonth, month, dayOfWeekStr] = parts;
    let dayOfWeek = parseInt(dayOfWeekStr, 10);
    if (dayOfWeek === 7) {
      dayOfWeek = 0;
    }
    const intervals = [2, 4, 6].map((offset) => (dayOfWeek + offset) % 7);
    const newDayOfWeek = intervals.join(",");
    return `${minute} ${hour} ${dayOfMonth} ${month} ${newDayOfWeek}`;
  }
}
