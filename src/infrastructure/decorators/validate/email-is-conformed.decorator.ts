/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { PostgresUserRepository } from '../../../features/users/repositories/postgres.user.repository';

export function EmailIsConformed(property?: string, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: EmailIsConformedConstraint,
    });
  };
}

// Обязательна регистрация в ioc
@ValidatorConstraint({ name: 'EmailIsConformed', async: false })
@Injectable()
export class EmailIsConformedConstraint implements ValidatorConstraintInterface {
  constructor(private readonly postgreeUserRepository: PostgresUserRepository) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const targerUser = await this.postgreeUserRepository.getByLoginOrEmail(value);
    if (!targerUser || targerUser.emailConfirmation.isConfirmed) return false;
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'email is already confirmed';
  }
}
