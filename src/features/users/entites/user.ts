/* eslint-disable no-underscore-dangle */
import { add } from 'date-fns';
import { Exception } from 'handlebars';

import { UserDbType } from '../types/input';
import { UserOutputType, UserPgDb } from '../types/output';

// noinspection RegExpRedundantEscape

export class AccountData {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export class EmailConfirmation {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

export class User {
  accountData: AccountData;
  emailConfirmation: EmailConfirmation;
  id: number;
  constructor(userData: UserDbType, passwordHash: string) {
    this.accountData = {
      login: userData.login,
      email: userData.email,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.emailConfirmation = {
      confirmationCode: crypto.randomUUID(),
      expirationDate: add(new Date(), {
        hours: 1,
      }),
      isConfirmed: false,
    };
  }
  static fromDbToObject(userData: UserPgDb): User {
    const newUser = Object.create(User.prototype);
    newUser.id = userData.id;
    newUser.accountData = {
      login: userData.login,
      email: userData.email,
      passwordHash: userData.passwordHash,
      createdAt: userData.createdAt.toISOString(),
    };

    newUser.emailConfirmation = {
      confirmationCode: userData.confirmationCode,
      expirationDate: userData.expirationDate,
      isConfirmed: userData.isConfirmed,
    };

    return newUser;
  }
  toDto(): UserOutputType {
    if (!this.id) throw new Exception('пытаешься сделать дто без id');
    return {
      id: this.id.toString(),
      login: this.accountData.login,
      email: this.accountData.email,
      createdAt: this.accountData.createdAt,
    };
  }
}
