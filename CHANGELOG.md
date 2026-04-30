# Changelog

All notable changes to @lookout/logger will be documented in this file.

## [1.0.0] - 2026-04-30

### Added
- Auto-population of environment context from environment variables (NODE_ENV, LOG_COMPONENT, OTEL_SERVICE_NAME, DEPLOYMENT_PROFILE, GIT_SHA)
- Strict typing for `tenantId` field (string | 'platform')
- `withTenant(tenantId)` method to create child logger with tenant context
- `withRequest(req)` method to extract request context including trace_id from headers
- `assertContext(keys)` method to validate required context keys in development/test
- Automatic traceId/spanId extraction from active OpenTelemetry context
- Additional context fields: service, deploymentProfile, version, traceId, spanId
- Enhanced `createRequestLogger` helper with header-based trace extraction

### Changed
- Updated LogContext interface to include new auto-populated fields
- Improved constructor to automatically populate environment context
- Updated package dependencies to include @opentelemetry/api
- Bumped version to 1.0.0 for stable release

### Fixed
- N/A

## [0.1.0] - 2026-04-XX

### Added
- Initial release of @lookout/logger
- Structured JSON-line logging
- Log levels: trace, debug, info, warn, error, fatal
- Helper methods: success, failure, requestStart, requestEnd, authSuccess, authFailure, dbQuery, dbSuccess, dbError, businessEvent, securityEvent, performance
- Runtime log level control
- Request-scoped logger creation
