import { UsersRepository } from './repositories/users.repository';
import { UserService } from './services/userService';
import { UserQueryRepository } from './repositories/user.query.repository';

export const userProviders = [UsersRepository, UserQueryRepository, UserService];
