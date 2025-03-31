import EventBridge from "@lib/infra/bridge";
import { ProviderRoutineDTO } from "../dto/dto";

export class EventService {
  bridge: EventBridge;

  constructor() {
    this.bridge = EventBridge.getInstance();
  }

  async publishProviderRoutine(inputData: ProviderRoutineDTO) {
    const { providerId, tags, locale, sendingDay } = inputData;

    await this.bridge.putRule(
      `${providerId}-collect`,
      `0 0 0 ? * ${sendingDay},${this.getAlternateDays(sendingDay)} *`,
      "ENABLED",
      {
        // triggered on every two days after sending day
        eventType: "collect",
        providerId,
        tags,
        locale,
      }
    );
    await this.bridge.putRule(
      `${providerId}-build`,
      `0 0 0 ? * ${sendingDay} *`,
      "ENABLED",
      {
        // triggered every sendingDay
        eventType: "build",
        providerId,
        tags,
        locale,
      }
    );
  }

  private getAlternateDays(sendingDay: string): string {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const sendingDayIndex = days.indexOf(sendingDay);

    if (sendingDayIndex === -1) {
      throw new Error(`Invalid sending day: ${sendingDay}`);
    }

    const day1 = days[(sendingDayIndex + 2) % 7];
    const day2 = days[(sendingDayIndex + 4) % 7];
    const day3 = days[(sendingDayIndex + 6) % 7];

    return `${day1},${day2},${day3}`;
  }

  async killProviderRoutine(providerId: string) {
    await this.bridge.deleteRule(`${providerId}-collect`);
    await this.bridge.deleteRule(`${providerId}-build`);
  }
}
