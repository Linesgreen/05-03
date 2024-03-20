import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { MailService } from '../../../../mail/mail.service';
import { User } from '../../../users/entites/user';
import { PostgresUserRepository } from '../../../users/repositories/postgres.user.repository';

export class EmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase implements ICommandHandler<EmailResendingCommand> {
  constructor(
    protected mailService: MailService,
    protected postgresUserRepository: PostgresUserRepository,
  ) {}

  async execute({ email }: EmailResendingCommand): Promise<Result<string>> {
    const targetUser: User | null = await this.postgresUserRepository.getByLoginOrEmail(email);
    if (!targetUser) return Result.Err(ErrorStatus.NOT_FOUND, 'user not found');
    // Обновляем код подтверждения и дату его протухания у пользователя
    targetUser.updateConfirmationCode();

    // Получаем информацию для обновления полей
    const { confirmationCode, expirationDate, login } = this.getUpdateFieldsInfo(targetUser);

    // Обновляем поле и отправляем письмо с подтверждением
    await this.updateFields(email, confirmationCode, expirationDate);
    await this.mailService.sendUserConfirmation(email, login, confirmationCode);
    return Result.Ok('email sended');
  }

  // Метод для получения информации для обновления полей
  private getUpdateFieldsInfo(targetUser: User): { confirmationCode: string; expirationDate: string; login: string } {
    const confirmationCode = targetUser.emailConfirmation.confirmationCode;
    const expirationDate = targetUser.emailConfirmation.expirationDate.toISOString();
    const login = targetUser.accountData.login;

    return { confirmationCode, expirationDate, login };
  }

  // Метод для обновления полей пользователя
  private async updateFields(email: string, confirmationCode: string, expirationDate: string): Promise<void> {
    const fieldToUpdate = {
      confirmationCode,
      expirationDate,
    };

    await this.postgresUserRepository.updateUserFields('email', email, fieldToUpdate);
  }
}
