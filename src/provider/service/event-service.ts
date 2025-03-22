import EventBridge from "@lib/infra/bridge";

interface ProviderRoutineData {
  providerId: string;
  userId: string;
  title: string;
  sendingDay: string;
  locale: string;
  categories: string[];
}

export class EventService {
  bridge: EventBridge;

  constructor() {
    this.bridge = new EventBridge();
  }

  async publishProviderRoutine(inputData: ProviderRoutineData) {
    const { providerId, categories, locale, sendingDay } = inputData;

    await this.bridge.putRule(`${providerId}-collect`, "0 0 */2 * * ?", "ENABLED", { // triggered every two days
      eventType: "collect",
      providerId,
      categories,
      locale,
    });
    await this.bridge.putRule(`${providerId}-build`, `0 0 0 ? * ${sendingDay} *`, "ENABLED", { // triggered every sendingDay
      eventType: "build",
      providerId,
      categories,
      locale,
    });
  }

  async killProviderRoutine(providerId: string) {
    await this.bridge.deleteRule(`${providerId}-collect`);
    await this.bridge.deleteRule(`${providerId}-builder`);
  }
}
