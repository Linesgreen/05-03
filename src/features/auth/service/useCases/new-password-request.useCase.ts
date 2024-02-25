import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MailService } from '../../../../mail/mail.service';
import { PostgresUserRepository } from '../../../users/repositories/postgresUserRepository';
import { AuthService } from '../auth.service';

export class NewPasswordRequestCommand {
  constructor(public email: string) {}
}

@CommandHandler(NewPasswordRequestCommand)
export class NewPasswordRequestUseCase implements ICommandHandler<NewPasswordRequestCommand> {
  constructor(
    protected mailService: MailService,
    protected postgreeUserRepository: PostgresUserRepository,
    protected authService: AuthService,
  ) {}

  async execute({ email }: NewPasswordRequestCommand): Promise<void> {
    const existResult = await this.chekUserIsExist(email);
    if (!existResult) return;

    const passwordRecoveryToken = await this.authService.createJwt({ email }, '3600');
    await this.sendEmail(email, passwordRecoveryToken);
  }

  private async chekUserIsExist(email: string): Promise<boolean> {
    const result = await this.postgreeUserRepository.chekUserIsExist(email);
    if (!result) {
      console.warn('User with email ' + email + ' not found');
      return false;
    }
    return true;
  }

  private async sendEmail(email: string, passwordRecoveryToken: string): Promise<void> {
    try {
      await this.mailService.sendUserConfirmation(email, 'User', passwordRecoveryToken);
    } catch (error) {
      console.error(error);
      throw new HttpException('Error send email', 500);
    }
  }
}
