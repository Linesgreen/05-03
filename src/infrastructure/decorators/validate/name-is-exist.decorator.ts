/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types,@typescript-eslint/no-explicit-any */
// noinspection PointlessBooleanExpressionJS

import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { PostgresUserRepository } from '../../../features/users/repositories/postgres.user.repository';

export function NameIsExist(property?: string, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: NameIsExistConstraint,
    });
  };
}

// Обязательна регистрация в ioc
@ValidatorConstraint({ name: 'NameIsExist', async: false })
@Injectable()
export class NameIsExistConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(PostgresUserRepository) private readonly postgreeUserRepository: PostgresUserRepository) {}

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async validate(value: any, args: ValidationArguments) {
    return !(await this.postgreeUserRepository.chekUserIsExist(value));
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property}  already exist`;
  }
}
