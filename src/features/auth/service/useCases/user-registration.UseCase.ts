import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result } from '../../../../infrastructure/object-result/objcet-result';
import { MailService } from '../../../../mail/mail.service';
import { User } from '../../../users/entites/user';
import { UserService } from '../../../users/services/user.service';
import { UserRegistrationModel } from '../../types/input';

export class UserRegistrationCommand {
  constructor(public userData: UserRegistrationModel) {}
}

@CommandHandler(UserRegistrationCommand)
export class UserRegistrationUseCase implements ICommandHandler<UserRegistrationCommand> {
  constructor(
    protected userService: UserService,
    protected mailService: MailService,
  ) {}

  async execute(command: UserRegistrationCommand): Promise<Result<string>> {
    const { email, login } = command.userData;
    const newUser: User = await this.userService.createUser(command.userData);
    const confirmationCode = newUser.emailConfirmation.confirmationCode;
    await this.mailService.sendUserConfirmation(email, login, confirmationCode);
    return Result.Ok('user registered successfully');
  }
}
