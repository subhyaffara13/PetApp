import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error occurred';

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} → ${status}`, exception instanceof Error ? exception.stack : String(exception));
    } else {
      this.logger.warn(`${request.method} ${request.url} → ${status}: ${typeof message === 'object' ? JSON.stringify(message) : message}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'object' ? (message as any).message || message : message,
    });
  }
}

/**
 * Wraps a synchronous or asynchronous function with a try/catch block.
 * Logs any encountered error and returns the provided fallback value,
 * ensuring the server function resolves safely.
 */
export function safeWrap<T, Args extends any[]>(
  fn: (...args: Args) => T,
  fallback: T | (() => T)
): (...args: Args) => T {
  return (...args: Args): T => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return (result as Promise<any>).catch((err) => {
          console.error('[Backend SafeWrap Async Error]:', err);
          return typeof fallback === 'function' ? (fallback as Function)() : fallback;
        }) as any;
      }
      return result;
    } catch (err) {
      console.error('[Backend SafeWrap Sync Error]:', err);
      return typeof fallback === 'function' ? (fallback as Function)() : fallback;
    }
  };
}
