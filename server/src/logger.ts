import pino, { LoggerOptions } from "pino";

const isProduction = process.env["NODE_ENV"] === "production";

let loggerOptions: LoggerOptions = {
  level: isProduction ? "info" : "debug",
};

if (!isProduction) {
  try {
    loggerOptions = {
      ...loggerOptions,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    };
  } catch (e) {
    // Fallback
  }
}

const logger = pino(loggerOptions);

export function logError<T>(message: string, error?: T) {
  if (error instanceof Error) {
    logger.error({ error }, message);
  }
  if (typeof error === "string") {
    logger.error({ error }, message);
  }
  if (typeof error === "object") {
    logger.error({ error }, message);
  }
  if (!error) {
    logger.error(message);
  }
}
export function logInfo(message: string) {
  logger.info(message);
}
export function logDebug(message: string) {
  logger.debug(message);
}
export function logWarn(message: string) {
  logger.warn(message);
}
export function logFatal(message: string, error?: Error) {
  logger.fatal({ error }, message);
}
export function logTrace(message: string) {
  logger.trace(message);
}
