import pino from "pino";
import pinoPretty from 'pino-pretty';

const isProduction = process.env.NODE_ENV === "production";

const loggerOptions = {
  level: process.env.LOG_LEVEL ?? 'info',
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    "res.headers['set-cookie']",
  ],
};

const prettyStream = isProduction
  ? undefined
  : pinoPretty({
      colorize: true,
      sync: true,
    });

export const logger = prettyStream
  ? pino(loggerOptions, prettyStream)
  : pino(loggerOptions);
