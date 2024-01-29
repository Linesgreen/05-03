import { add } from 'date-fns';

export type UserCreateType = {
  login: string;
  password: string;
  email: string;
};

//TODO узнать куда ложить этот класс вообще
export class UserDb {
  public _id: string;
  public accountData: UserAccountData;
  public emailConfirmation: UserEmailConfirmation;
  constructor(userData: UserCreateType, passwordHash: string) {
    this._id = crypto.randomUUID();
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
}

type UserAccountData = {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type UserEmailConfirmation = {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
};

export type UserSortData = {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: string;
  pageSize?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};
