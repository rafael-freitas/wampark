import { createLogger, format, transports } from 'winston';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import os from 'os';
import { threadId } from 'worker_threads';
import colors from 'colors/safe.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const { combine, printf } = format;

/**
 * ApplicationLogger class for structured and formatted logging.
 */
class ApplicationLogger {
  /**
   * Constructor for ApplicationLogger.
   * @param {string} service - The name of the service or microservice.
   * @param {string} [app=''] - The specific part of the service generating the log.
   * @param {string} [timezone=Intl.DateTimeFormat().resolvedOptions().timeZone] - The timezone for formatting timestamps.
   * @param {Object} [blocks={}] - Initial blocks for the logger instance.
   */
  constructor(service, app = '', timezone = Intl.DateTimeFormat().resolvedOptions().timeZone, blocks = {}) {
    this.service = service;
    this.app = app;
    this.timezone = timezone;
    this.blocks = { ...blocks };
    this.hostname = process.env.HOSTNAME || os.hostname();

    // Create a Winston logger instance with the specified format and transports
    this.logger = createLogger({
      level: 'info',
      format: combine(
        printf(({ level, message }) => {
          const formattedTimestamp = colors.gray(dayjs().tz(this.timezone).format('YYYY-MM-DD HH:mm:ss'));
          const worker = colors.gray(`Worker ${String(threadId).padStart(2, ' ')}`);
          const hostname = colors.gray(this.hostname);
          const service = colors.white(this.service);
          const app = colors.cyan(this.app);
          const levelColor = level.toUpperCase() === 'INFO' ? colors.green : level.toUpperCase() === 'ERROR' ? colors.red : colors.yellow;
          const coloredLevel = levelColor(level.toUpperCase());
          const blocksString = Object.entries(this.blocks)
            .map(([key, { value, color }]) => {
              const coloredValue = value ? (color ? colors[color](value) : colors.green(value)) : '';
              return `[${key}${coloredValue ? `=${coloredValue}` : ''}]`;
            })
            .join('');
          return `[${formattedTimestamp}][${worker}][${coloredLevel}][${service}][${app}]${blocksString} ${message}`;
        })
      ),
      transports: [
        new transports.Console()
      ],
    });

    // Add color methods to the class
    this.addColorMethods();
  }

  /**
   * Add color methods to the class.
   */
  addColorMethods() {
    this.black = (text) => colors.black(text);
    this.red = (text) => colors.red(text);
    this.green = (text) => colors.green(text);
    this.yellow = (text) => colors.yellow(text);
    this.blue = (text) => colors.blue(text);
    this.magenta = (text) => colors.magenta(text);
    this.cyan = (text) => colors.cyan(text);
    this.white = (text) => colors.white(text);
    this.gray = (text) => colors.gray(text);
    this.grey = (text) => colors.grey(text);
  }

  /**
   * Create a new logger instance for a specific app and optionally a different timezone.
   * @param {string} app - The specific part of the service generating the log.
   * @param {string} [timezone=this.timezone] - The timezone for formatting timestamps.
   * @returns {ApplicationLogger} A new logger instance.
   */
  create(app, timezone = this.timezone) {
    return new ApplicationLogger(this.service, app, timezone);
  }

  /**
   * Add a block to the logger instance.
   * @param {string} key - The key for the block.
   * @param {string} [value=''] - The value for the block.
   * @param {string} [color=''] - The color for the block value.
   * @returns {ApplicationLogger} A new logger instance with the added block.
   */
  block(key, value = '', color = '') {
    const newBlocks = { ...this.blocks, [key]: { value, color } };
    return new ApplicationLogger(this.service, this.app, this.timezone, newBlocks);
  }

  /**
   * Log a message with a specific log level and optional color.
   * @param {string} level - The log level (e.g., 'info', 'warn', 'error', 'debug').
   * @param {string} message - The message to log.
   * @param {string} [color=''] - The color for the message.
   */
  log(level, message, color = '') {
    const coloredMessage = color ? colors[color](message) : message;
    this.logger.log(level, coloredMessage);
  }

  /**
   * Log an info level message with optional color.
   * @param {string} message - The message to log.
   * @param {string} [color=''] - The color for the message.
   */
  info(message, color = '') {
    this.log('info', message, color);
  }

  /**
   * Log a warn level message with optional color.
   * @param {string} message - The message to log.
   * @param {string} [color=''] - The color for the message.
   */
  warn(message, color = '') {
    this.log('warn', message, color);
  }

  /**
   * Log an error level message with optional color.
   * @param {string} message - The message to log.
   * @param {string} [color=''] - The color for the message.
   */
  error(message, color = '') {
    this.log('error', message, color);
  }

  /**
   * Log a debug level message with optional color.
   * @param {string} message - The message to log.
   * @param {string} [color=''] - The color for the message.
   */
  debug(message, color = '') {
    this.log('debug', message, color);
  }
}

export default ApplicationLogger;
