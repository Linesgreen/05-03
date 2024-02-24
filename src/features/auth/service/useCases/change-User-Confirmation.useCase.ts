import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostgresUserRepository } from '../../../users/repositories/postgresUserRepository';

export class ChangeUserConfirmationCommand {
  constructor(
    public confCode: string,
    public confirmationStatus: boolean,
  ) {}
}

@CommandHandler(ChangeUserConfirmationCommand)
export class ChangeUserConfirmationUseCase implements ICommandHandler<ChangeUserConfirmationCommand> {
  constructor(protected postgreeUserRepository: PostgresUserRepository) {}

  async execute(command: ChangeUserConfirmationCommand): Promise<void> {
    const { confCode, confirmationStatus } = command;

    await this.postgreeUserRepository.updateFields('confirmationCode', confCode, { isConfirmed: confirmationStatus });
  }
}
