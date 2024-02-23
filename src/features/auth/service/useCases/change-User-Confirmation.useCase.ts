import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostgreeUserRepository } from '../../../users/repositories/postgree.user.repository';

export class ChangeUserConfirmationCommand {
  constructor(
    public confCode: string,
    public confirmationStatus: boolean,
  ) {}
}

@CommandHandler(ChangeUserConfirmationCommand)
export class ChangeUserConfirmationUseCase implements ICommandHandler<ChangeUserConfirmationCommand> {
  constructor(protected postgreeUserRepository: PostgreeUserRepository) {}

  async execute(command: ChangeUserConfirmationCommand): Promise<void> {
    const { confCode, confirmationStatus } = command;

    await this.postgreeUserRepository.updateField('confirmationCode', confCode, 'isConfirmed', confirmationStatus);
  }
}
