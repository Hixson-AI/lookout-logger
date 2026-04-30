export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  requestId?: string;
  tenantId?: string;
  userId?: string;
  email?: string;
  action?: string;
  resource?: string;
  duration?: string | number;
  component?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context: LogContext;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private context: LogContext = {};
  private currentLevel: LogLevel;
  private serviceName: string;
  private useOtlp: boolean;

  constructor(context: LogContext = {}) {
    this.context = context;
    this.serviceName = process.env['OTEL_SERVICE_NAME'] || 'unknown-service';
    this.useOtlp = !!process.env['OTEL_EXPORTER_OTLP_ENDPOINT'];
    this.currentLevel = (process.env['LOG_LEVEL'] as LogLevel) ||
      (process.env['NODE_ENV'] === 'development' ? 'debug' : 'info');

    // Initialize OTLP logger if enabled
    if (this.useOtlp) {
      this.initOtlpLogger();
    }
  }

  private initOtlpLogger(): void {
    // OTLP logger initialization will be added in a follow-up
    // For now, we'll just log a debug message
    if (this.currentLevel === 'debug' || this.currentLevel === 'trace') {
      console.log(JSON.stringify({
        level: 'debug',
        message: 'OTLP logger enabled (implementation pending)',
        timestamp: new Date().toISOString(),
        context: { ...this.context, component: 'logger' }
      }));
    }
  }

  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
    const currentIdx = levels.indexOf(this.currentLevel);
    const targetIdx = levels.indexOf(level);
    return targetIdx >= currentIdx;
  }

  private writeLog(level: LogLevel, message: string, error?: Error | unknown, context: LogContext = {}): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const allContext = { ...this.context, ...context, service: this.serviceName };
    const errorContext = error instanceof Error
      ? { error: error.message, stack: error.stack }
      : error ? { error } : undefined;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: allContext,
      ...errorContext
    };

    // JSON-line output to stdout
    console.log(JSON.stringify(entry));
  }

  trace(message: string, context: LogContext = {}): void {
    this.writeLog('trace', message, undefined, context);
  }

  debug(message: string, context: LogContext = {}): void {
    this.writeLog('debug', message, undefined, context);
  }

  info(message: string, context: LogContext = {}): void {
    this.writeLog('info', message, undefined, context);
  }

  warn(message: string, context: LogContext = {}): void {
    this.writeLog('warn', message, undefined, context);
  }

  error(message: string, error?: Error | unknown, context: LogContext = {}): void {
    this.writeLog('error', message, error, context);
  }

  fatal(message: string, error?: Error | unknown, context: LogContext = {}): void {
    this.writeLog('fatal', message, error, context);
  }
}

// Default logger instance
export const logger = new Logger();

export { Logger };
