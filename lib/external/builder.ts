import * as axios from "axios";
import { Express } from "express";

interface BuilderConfig {
  NEWSLETTER_SERVER_URL: string;
}

class Builder {
  constructor() {}
  private static config: BuilderConfig = {
    NEWSLETTER_SERVER_URL: "127.0.0.1",
  };

  public static initApp(app: Express): void {
    const { NEWSLETTER_SERVER_URL } = app.get("config");
    Builder.config.NEWSLETTER_SERVER_URL = NEWSLETTER_SERVER_URL;
  }

  public static async createScheduler() {
    // TODO: Implement this
  }

  public static async deleteScheduler() {
    // TODO: Implement this
  }

  private static async createNewsletter() {
    // TODO: Implement this
  }
}

export default Builder;
