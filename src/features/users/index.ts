import { PostgresUserQueryRepository } from './repositories/postgres.user.query.repository';
import { PostgresUserRepository } from './repositories/postgresUserRepository';
import { UserQueryRepository } from './repositories/user.query.repository';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';

export const userProviders = [
  UserRepository,
  UserQueryRepository,
  UserService,
  PostgresUserRepository,
  PostgresUserQueryRepository,
];
