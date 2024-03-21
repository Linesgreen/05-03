import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();
class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  //TODO понять нафига
  public ensureValues(keys: string[]): ConfigService {
    keys.forEach((k) => this.getValue(k));
    return this;
  }

  public getPort(): string {
    return this.getValue('PORT');
  }

  public isProduction(): boolean {
    const mode = this.getValue('MODE');
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      autoLoadEntities: false,
      synchronize: false,
    };
  }
  public getGmailUser(): string {
    const user = this.getValue('GMAIL_USER');
    return user;
  }
  public getGmailPass(): string {
    const pass = this.getValue('GMAIL_PASS');
    return pass;
  }
  public getTokenExp(): string {
    const tokenExp = this.getValue('TOKEN_EXP');
    return tokenExp;
  }
  public getRefreshTokenExp(): string {
    const refreshTokenExp = this.getValue('REFRESH_TOKEN_EXP');
    return refreshTokenExp;
  }
  private getValue(key: string): string {
    const value = this.env[key];
    if (!value) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
  'PORT',
  'GMAIL_USER',
  'GMAIL_PASS',
  'TOKEN_EXP',
  'REFRESH_TOKEN_EXP',
]);

export { configService };
