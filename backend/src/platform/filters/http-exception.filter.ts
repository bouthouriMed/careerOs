import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { AppError } from '../errors/app-error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      return response.status(exception.statusCode).json({
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
        },
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const body = exceptionResponse as Record<string, unknown>;
      return response.status(status).json({
        error: {
          code: (body.error as string) || 'HTTP_ERROR',
          message: typeof exceptionResponse === 'string' ? exceptionResponse : (body.message as string),
        },
      });
    }

    const message = exception instanceof Error ? exception.message : 'Internal server error';
    return response.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
    });
  }
}
