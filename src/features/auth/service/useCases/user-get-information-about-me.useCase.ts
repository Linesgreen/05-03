import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostgresUserQueryRepository } from '../../../users/repositories/postgres.user.query.repository';
import { AboutMeType } from '../../types/output';

export class UserGetInformationAboutMeCommand {
  constructor(public userId: string) {}
}
@CommandHandler(UserGetInformationAboutMeCommand)
export class GetInformationAboutUserCase implements ICommandHandler<UserGetInformationAboutMeCommand> {
  constructor(private postgresUserQueryRepository: PostgresUserQueryRepository) {}

  async execute({ userId }: UserGetInformationAboutMeCommand): Promise<AboutMeType> {
    console.log(userId);
    const user = await this.postgresUserQueryRepository.getUserById(userId);
    if (!user) throw new NotFoundException();
    const { email, login, id } = user;
    return { email, login, userId: id };
  }
}
