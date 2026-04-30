# @lookout/logger

Shared JSON-line structured logger for Lookout platform services with optional OTLP log exporter.

## Features

- JSON-line output to stdout (parseable by log shippers)
- Structured context: `tenant_id`, `request_id`, `user_id`, `component`, `action`, `resource`
- Log levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
- Child logger pattern for request-scoped context
- Optional OTLP log exporter when `OTEL_EXPORTER_OTLP_ENDPOINT` is set
- Drop-in replacement for existing `src/lib/logger.ts` in Lookout services

## Usage

```typescript
import { logger } from '@lookout/logger';

// Basic usage
logger.info('Server started', { port: 8080 });

// Child logger with context
const log = logger.child({ component: 'server', tenantId: 'xxx' });
log.info('Request received', { requestId: 'yyy', action: 'create_app' });

// Error logging
try {
  // ...
} catch (error) {
  logger.error('Failed to process', error, { userId: 'zzz' });
}
```

## Environment Variables

- `LOG_LEVEL` - Minimum log level (default: `info` in production, `debug` in development)
- `NODE_ENV` - Falls back to `debug` if set to `development`
- `OTEL_SERVICE_NAME` - Service name for log labeling (default: `unknown-service`)
- `OTEL_EXPORTER_OTLP_ENDPOINT` - OTLP endpoint for log export (optional, enables OTLP exporter)

## Log Format

All logs are emitted as JSON to stdout:

```json
{
  "level": "info",
  "message": "Request received",
  "timestamp": "2026-04-29T12:34:56.789Z",
  "context": {
    "tenantId": "xxx",
    "requestId": "yyy",
    "action": "create_app",
    "service": "lookout-api"
  }
}
```

## Installation

```bash
pnpm add @lookout/logger
```

## Development

```bash
pnpm install
pnpm build
pnpm dev  # Watch mode
```

## OTLP Support

OTLP log exporter is planned but not yet implemented. When enabled via `OTEL_EXPORTER_OTLP_ENDPOINT`, logs will be sent to an OpenTelemetry Collector in addition to stdout.

## License

MIT
