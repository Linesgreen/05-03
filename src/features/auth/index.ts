import { SessionQueryRepository } from './repository/session.query.repository';
import { SessionRepository } from './repository/session-repository';
import { AuthService } from './service/auth.service';

export const authProviders = [AuthService, SessionRepository, SessionQueryRepository];
