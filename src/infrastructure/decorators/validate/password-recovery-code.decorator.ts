/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types,@typescript-eslint/no-explicit-any */
// noinspection PointlessBooleanExpressionJS

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function RecoveryCodeIsValid(property?: string, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: RecoveryCodeIsValidConstraint,
    });
  };
}

// Обязательна регистрация в ioc
@ValidatorConstraint({ name: 'RecoveryCodeIsValid', async: false })
@Injectable()
export class RecoveryCodeIsValidConstraint implements ValidatorConstraintInterface {
  constructor(private jwtService: JwtService) {}

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async validate(value: any, args: ValidationArguments) {
    try {
      await this.jwtService.verifyAsync(value);
      return true;
    } catch (e) {
      console.warn(e);
      return false;
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `code not valid`;
  }
}
