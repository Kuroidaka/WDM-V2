// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { isObject } from 'utils';  // Ensure isObject properly checks for non-null objects

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;


    let responseData;
    console.log(exception)
    if(typeof (exception?.getResponse) === 'function') {
      responseData = exception?.getResponse();
    }
    else {
      responseData = { message: 'server error' };
    }

    console.log(responseData);

    response.status(status).json({
      status: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: responseData.message,
    });
  }
}
