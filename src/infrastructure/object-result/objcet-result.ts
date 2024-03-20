/* eslint-disable @typescript-eslint/no-explicit-any,no-underscore-dangle,@typescript-eslint/member-ordering */
import { HttpException, NotFoundException } from '@nestjs/common';

export enum ErrorStatus {
  // OK_200 = 200,
  // CREATED_201 = 201,
  //NO_CONTENT_204 = 204,
  //BAD_REQUEST_400 = 400,
  NOT_FOUND = 'NOT_FOUND',
  //UNAUTHORIZED_401 = 401,
  // FORBIDDEN_403 = 403,
  SERVER_ERROR = 'SERVER_ERROR',
}

type ErrorStatusKeys = keyof typeof ErrorStatus;
export type HttpStatusType = (typeof ErrorStatus)[ErrorStatusKeys];

export class Result<T = void> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: HttpStatusType,
  ) {}

  public static Ok<T>(value?: T): Result<T> {
    let parsedValue: any = true;

    if (value === null || value === undefined || value === false || Number(value) === 0) {
      parsedValue = null;
    } else {
      parsedValue = value;
    }

    return new Result<T>(true, parsedValue as unknown as T);
  }

  public static Err<T>(err: HttpStatusType, value?: T): Result<T> {
    return new Result<T>(false, value, err);
  }

  get value(): T {
    if (!this._value && Number(this._value) !== 0) throw new Error('cant extract value from Result');
    return this._value!;
  }

  get err(): HttpStatusType {
    if (!this._error) throw new Error('cant extract error from Result');
    return this._error;
  }
  isSuccess(): boolean {
    return this._isSuccess;
  }
  isFailure(): boolean {
    return !this._isSuccess;
  }
}

export class ErrorResulter {
  static proccesError<T>(error: Result<T>): void {
    switch (error.err) {
      case ErrorStatus.NOT_FOUND:
        throw new NotFoundException(error.value);
        break;
      case 'SERVER_ERROR':
        throw new HttpException(error.value as string, 500);
        break;
    }
  }
}
