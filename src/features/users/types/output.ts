export type UserOutputType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export class UserPgDb {
  id: number;
  login: string;
  email: string;
  passwordHash: string;
  confirmationCode: string;
  expirationDate: Date;
  createdAt: Date;
  isConfirmed: boolean;
}
