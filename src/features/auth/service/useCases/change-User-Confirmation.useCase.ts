import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result } from '../../../../infrastructure/object-result/objcet-result';
import { PostgresUserRepository } from '../../../users/repositories/postgres.user.repository';

export class ChangeUserConfirmationCommand {
  constructor(
    public confCode: string,
    public confirmationStatus: boolean,
  ) {}
}

@CommandHandler(ChangeUserConfirmationCommand)
export class ChangeUserConfirmationUseCase implements ICommandHandler<ChangeUserConfirmationCommand> {
  constructor(protected postgreeUserRepository: PostgresUserRepository) {}

  async execute(command: ChangeUserConfirmationCommand): Promise<Result<string>> {
    const { confCode, confirmationStatus } = command;

    await this.postgreeUserRepository.updateUserFields('confirmationCode', confCode, {
      isConfirmed: confirmationStatus,
    });
    return Result.Ok('user confirmed successfully');
  }
}
