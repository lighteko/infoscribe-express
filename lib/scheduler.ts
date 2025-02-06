import { ScheduledTask, schedule } from "node-cron";

export class Scheduler {
  static tasks: Map<string, ScheduledTask>;
  constructor() {}

  public static init() {
    Scheduler.tasks = new Map<string, ScheduledTask>();
  }

  addTask(name: string, expression: string, callback: ((now: Date | "manual" | "init") => void) | string, autoStart = true) {
    if (Scheduler.tasks.has(name)) {
      console.log(`Task '${name}' already exists.`);
      return;
    }

    const task = schedule(expression, callback, { scheduled: autoStart });
    Scheduler.tasks.set(name, task);
    console.log(`Task '${name}' added.`);
  }

  startTask(name: string) {
    const task = Scheduler.tasks.get(name);
    if (task) {
      task.start();
      console.log(`Task '${name}' started.`);
    } else {
      console.log(`Task '${name}' not found.`);
    }
  }

  stopTask(name: string) {
    const task = Scheduler.tasks.get(name);
    if (task) {
      task.stop();
      console.log(`Task '${name}' stopped.`);
    } else {
      console.log(`Task '${name}' not found.`);
    }
  }

  removeTask(name: string) {
    const task = Scheduler.tasks.get(name);
    if (task) {
      task.stop();
      Scheduler.tasks.delete(name);
      console.log(`Task '${name}' removed.`);
    } else {
      console.log(`Task '${name}' not found.`);
    }
  }

  listTasks() {
    console.log("Scheduled Tasks:", [...Scheduler.tasks.keys()]);
  }
}
