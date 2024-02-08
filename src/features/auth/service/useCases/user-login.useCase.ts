/* eslint-disable no-underscore-dangle */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

export class UserLoginCommand {
  constructor(public userId: string) {}
}

@CommandHandler(UserLoginCommand)
export class UserLoginUseCase implements ICommandHandler<UserLoginCommand> {
  constructor(protected jwtService: JwtService) {}

  async execute({ userId }: UserLoginCommand): Promise<{ token: string; refreshToken: string }> {
    // const { userId } = command;
    return this.generateTokensPair(userId);
  }

  async generateTokensPair(payload: string): Promise<{ token: string; refreshToken: string }> {
    const token = await this.createJwt(payload, 3);
    const refreshToken = await this.createJwt(payload, 10);
    return { token, refreshToken };
  }
  /**
   * Create JWT Token
   * @param userId
   * @param expirationTime : hours count
   * @returns token
   */
  async createJwt(userId: string, expirationTime: number): Promise<string> {
    return this.jwtService.signAsync({ userId: userId }, { expiresIn: `${expirationTime}h` });
  }
}
