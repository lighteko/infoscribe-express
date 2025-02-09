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

    this.bridge.putRule(`${providerId}-collect`, "", "ENABLED", {
      providerId,
      categories,
      locale,
    });
    this.bridge.putRule(`${providerId}-build`, "", "ENABLED", {
      providerId,
      sendingDay,
    });
  }

  async killProviderRoutine(providerId: string) {
    this.bridge.deleteRule(`${providerId}-collect`);
    this.bridge.deleteRule(`${providerId}-builder`);
  }
}
