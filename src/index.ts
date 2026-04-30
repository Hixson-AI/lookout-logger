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
  environment?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context: LogContext;
  error?: string | {
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
    this.context = {
      environment: process.env['NODE_ENV'] || 'production',
      ...context,
    };
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
    
    let entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: allContext,
    };

    if (error) {
      if (error instanceof Error) {
        entry.error = {
          message: error.message,
          stack: error.stack,
        };
      } else {
        entry.error = String(error);
      }
    }

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

  // Happy path helpers
  success(message: string, context: LogContext = {}): void {
    this.info(`✅ ${message}`, context);
  }

  // Sad path helpers
  failure(message: string, error?: Error | unknown, context: LogContext = {}): void {
    this.error(`❌ ${message}`, error, context);
  }

  // Request lifecycle helpers
  requestStart(method: string, path: string, context: LogContext = {}): void {
    this.debug(`${method} ${path} - Request started`, context);
  }

  requestEnd(method: string, path: string, statusCode: number, context: LogContext = {}): void {
    const statusEmoji = statusCode < 300 ? '✅' : statusCode < 400 ? '↩️' : statusCode < 500 ? '⚠️' : '❌';
    this.info(`${statusEmoji} ${method} ${path} - ${statusCode}`, context);
  }

  // Auth helpers
  authSuccess(provider: string, email: string, context: LogContext = {}): void {
    this.success(`Authentication successful via ${provider}`, { email, ...context });
  }

  authFailure(provider: string, reason: string, context: LogContext = {}): void {
    this.warn(`Authentication failed via ${provider}: ${reason}`, context);
  }

  // Database helpers
  dbQuery(operation: string, table: string, context: LogContext = {}): void {
    this.debug(`DB Query: ${operation} on ${table}`, context);
  }

  dbSuccess(operation: string, table: string, context: LogContext = {}): void {
    this.debug(`DB Success: ${operation} on ${table}`, context);
  }

  dbError(operation: string, table: string, error: Error | unknown, context: LogContext = {}): void {
    this.failure(`DB Error: ${operation} on ${table}`, error, context);
  }

  // Business logic helpers
  businessEvent(event: string, context: LogContext = {}): void {
    this.info(`🏢 Business Event: ${event}`, context);
  }

  securityEvent(event: string, context: LogContext = {}): void {
    this.warn(`🔒 Security Event: ${event}`, context);
  }

  // Performance helpers
  performance(operation: string, duration: number, context: LogContext = {}): void {
    const level = duration > 1000 ? 'warn' : duration > 100 ? 'info' : 'debug';
    if (this.shouldLog(level)) {
      this.writeLog(level, `⚡ Performance: ${operation} completed in ${duration}ms`, undefined, context);
    }
  }

  // Set log level at runtime
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  // Get current log level
  getLevel(): LogLevel {
    return this.currentLevel;
  }
}

// Default logger instance
export const logger = new Logger();

export { Logger };

// Helper to create logger with request context
export function createRequestLogger(req: {
  id?: string;
  ip?: string;
  method?: string;
  path?: string;
  route?: string;
}): Logger {
  return logger.child({
    requestId: req.id,
    ip: req.ip,
    method: req.method,
    path: req.path,
    route: req.route || req.path,
  });
}
