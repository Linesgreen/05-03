//TODO Что то думать с этим классом
export class SessionPgDb {
  id: number;
  tokenKey: string;
  issuedDate: string;
  expiredDate: Date;
  title: string;
  userId: string;
  ip: string;
  deviceId: string;
}
