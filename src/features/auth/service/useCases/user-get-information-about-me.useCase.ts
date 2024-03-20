import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { PostgresUserQueryRepository } from '../../../users/repositories/postgres.user.query.repository';
import { AboutMeType } from '../../types/output';

export class UserGetInformationAboutMeCommand {
  constructor(public userId: string) {}
}
@CommandHandler(UserGetInformationAboutMeCommand)
export class GetInformationAboutUserCase implements ICommandHandler<UserGetInformationAboutMeCommand> {
  constructor(private postgresUserQueryRepository: PostgresUserQueryRepository) {}

  async execute({ userId }: UserGetInformationAboutMeCommand): Promise<Result<AboutMeType | string>> {
    const user = await this.postgresUserQueryRepository.getUserById(userId);
    if (!user) return Result.Err(ErrorStatus.NOT_FOUND, 'User not found');
    const { email, login, id } = user;
    return Result.Ok({ email, login, userId: id });
  }
}
