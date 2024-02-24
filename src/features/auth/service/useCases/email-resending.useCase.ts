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

  async execute({ email }: EmailResendingCommand): Promise<void> {
    const targetUser: User | null = await this.postgreeUserRepository.getByLoginOrEmail(email);
    if (!targetUser) throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    //Обновляем код и дату у пользователя
    targetUser.updateConfirmationCode();

    const confirmationCode = targetUser.emailConfirmation.confirmationCode;
    //Делаем isoString иначе ругается что дата не подходит
    const expirationDate = targetUser.emailConfirmation.expirationDate.toISOString();
    const login = targetUser.accountData.login;

    await this.updateFields(email, confirmationCode, expirationDate);
    await this.mailService.sendUserConfirmation(email, login, confirmationCode);
  }

  private async updateFields(email: string, confirmationCode: string, expirationDate: string): Promise<void> {
    const fieldToUpdate = {
      confirmationCode: confirmationCode,
      expirationDate: expirationDate,
    };
    await this.postgreeUserRepository.updateFields('email', email, fieldToUpdate);
  }
}
