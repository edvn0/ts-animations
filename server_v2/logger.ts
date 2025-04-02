import Logger from "https://deno.land/x/logger@v1.2.0/logger.ts";

const logger = new Logger();

export function logError<T>(message: string, error?: T) {
	if (error instanceof Error) {
		logger.error({ error }, message)
	}
	if (typeof error === 'string') {
		logger.error({ error }, message)
	}
	if (typeof error === 'object') {
		logger.error({ error }, message)
	}
	if (!error) {
		logger.error(message)
	}
}
export function logInfo<T = string>(message: T) {
	if (typeof message === 'object') {
		logger.info(JSON.stringify(message));
	} else {
		logger.info(message)
	}
}
export function logDebug(message: string) {
	logger.debug(message)
}
export function logWarn(message: string) {
	logger.warn(message)
}
export function logFatal(message: string, error?: Error) {
	logger.error({ error }, message)
}
export function logTrace(message: string) {
	logger.info(message)
}
