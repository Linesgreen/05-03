import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MailService } from '../../../../mail/mail.service';
import { User } from '../../../users/entites/user';
import { PostgresUserRepository } from '../../../users/repositories/postgresUserRepository';

export class EmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase implements ICommandHandler<EmailResendingCommand> {
  constructor(
    protected mailService: MailService,
    protected postgreeUserRepository: PostgresUserRepository,
  ) {}

  async execute(command: EmailResendingCommand): Promise<void> {
    const { email } = command;
    const targetUser: User | null = await this.postgreeUserRepository.getByLoginOrEmail(email);
    if (!targetUser) throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    targetUser.updateConfirmationCode();
    const confirmationCode = targetUser.emailConfirmation.confirmationCode;
    //Делаем isoString иначе ругается что дата не подходит
    const expirationDate = targetUser.emailConfirmation.expirationDate.toISOString();
    console.log(confirmationCode);
    await this.postgreeUserRepository.updateField('email', email, 'confirmationCode', confirmationCode);
    await this.postgreeUserRepository.updateField('email', email, 'expirationDate', expirationDate);

    await this.mailService.sendUserConfirmation(
      targetUser.accountData.email,
      targetUser.accountData.login,
      targetUser.emailConfirmation.confirmationCode,
    );
  }
}
