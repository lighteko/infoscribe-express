import winston from "winston";

const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const initLogger = (level: string) => winston.createLogger({
  level,
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    label({ label: "Express" }),
    logFormat
  ),
  transports: [new winston.transports.Console()],
});

export default initLogger;
