// Consolidated into a single file — see docs for bundler compatibility rationale

export interface ILogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export class ConsoleAdapter implements ILogger {
  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug('[DEBUG]', message, ...(meta ? [meta] : []));
  }
  info(message: string, meta?: Record<string, unknown>): void {
    console.info('[INFO]', message, ...(meta ? [meta] : []));
  }
  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn('[WARN]', message, ...(meta ? [meta] : []));
  }
  error(message: string, meta?: Record<string, unknown>): void {
    console.error('[ERROR]', message, ...(meta ? [meta] : []));
  }
}

// Singleton listo para usar — ideal para frontend donde no hay Composition Root
export const logger: ILogger = new ConsoleAdapter();
