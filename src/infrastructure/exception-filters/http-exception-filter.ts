/* eslint-disable @typescript-eslint/explicit-function-return-type,@typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorMessage = exception.message || 'Ресурс не найден';
    //TODO копать тут
    if (status === HttpStatus.NOT_FOUND) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: errorMessage,
        path: request.url,
      });
      return;
    }
    if (status === HttpStatus.BAD_REQUEST) {
      const errorsResponse = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();
      if (Array.isArray(responseBody.message)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment

        // @ts-ignore
        responseBody.message.forEach((m) => errorsResponse.errorsMessages.push(m));
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment

        // @ts-ignore
        errorsResponse.errorsMessages.push(responseBody.message);
      }

      response.status(status).json(errorsResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
