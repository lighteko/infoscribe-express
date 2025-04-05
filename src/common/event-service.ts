import EventBridge from "@lib/infra/bridge";
import { ProviderRoutineDTO } from "@provider/dto/dto";

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
    console.log(newCron);
    return newCron;
  }
}
