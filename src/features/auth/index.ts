import { SessionPostgresQueryRepository } from '../security/repository/session.postgres.query.repository';
import { PostgresSessionRepository } from '../security/repository/session.postgres.repository';
import { SessionQueryRepository } from '../security/repository/session.query.repository';
import { SessionRepository } from '../security/repository/session.repository';
import { SessionService } from '../security/service/session.service';
import { AuthService } from './service/auth.service';
import { ChangePasswordUseCase } from './service/useCases/change-password.useCase';
import { ChangeUserConfirmationUseCase } from './service/useCases/change-User-Confirmation.useCase';
import { EmailResendingUseCase } from './service/useCases/email-resending.useCase';
import { NewPasswordRequestUseCase } from './service/useCases/new-password-request.useCase';
import { RefreshTokenUseCase } from './service/useCases/refresh-token.useCase';
import { GetInformationAboutUserCase } from './service/useCases/user-get-information-about-me.useCase';
import { UserLoginUseCase } from './service/useCases/user-login.useCase';
import { UserRegistrationUseCase } from './service/useCases/user-registration.UseCase';

export const authProviders = [
  AuthService,
  SessionRepository,
  SessionService,
  SessionQueryRepository,
  PostgresSessionRepository,
  SessionPostgresQueryRepository,
];
export const authUseCases = [
  UserRegistrationUseCase,
  UserLoginUseCase,
  GetInformationAboutUserCase,
  RefreshTokenUseCase,
  EmailResendingUseCase,
  ChangeUserConfirmationUseCase,
  NewPasswordRequestUseCase,
  ChangePasswordUseCase,
];
