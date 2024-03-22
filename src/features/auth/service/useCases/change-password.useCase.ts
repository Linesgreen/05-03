import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { Result } from '../../../../infrastructure/object-result/objcet-result';
import { PostgresUserRepository } from '../../../users/repositories/postgres.user.repository';

export class ChangePasswordCommand {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordUseCase implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    protected postgresUserRepository: PostgresUserRepository,
    protected jwtService: JwtService,
  ) {}

  async execute({ newPassword, recoveryCode }: ChangePasswordCommand): Promise<Result<string>> {
    const userEmail = this.getEmailFromJwt(recoveryCode);
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await this.updatePasswordInDb(userEmail, newPasswordHash);
    return Result.Ok('password changed successfully');
  }

  private getEmailFromJwt(jwt: string): string {
    const { email } = this.jwtService.decode(jwt);
    return email;
  }

  private updatePasswordInDb(email: string, newPassword: string): Promise<void> {
    return this.postgresUserRepository.updateUserFields('email', email, { passwordHash: newPassword });
  }
}
