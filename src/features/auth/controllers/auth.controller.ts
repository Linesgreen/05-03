import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';

import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { LocalAuthGuards } from '../../../infrastructure/guards/local-auth.guards';
import { CurrentUser } from '../decorators/current-user.decrator';
import { ChangeUserConfirmationCommand } from '../service/useCases/change-User-Confirmation-UserCase';
import { EmailResendingCommand } from '../service/useCases/email-resending.useCase';
import { UserGetInformationAboutMeCommand } from '../service/useCases/user-get-information-about-me.useCase';
import { UserLoginCommand } from '../service/useCases/user-login.useCase';
import { UserRegistrationCommand } from '../service/useCases/user-registration,UseCase';
import { EmailResendingModel, UserRegistrationModel, ValidationCodeModel } from '../types/input';
import { AboutMeType } from '../types/output';

@Controller('auth')
export class AuthController {
  constructor(
    //protected authService: AuthService,
    private commandBus: CommandBus,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuards)
  @HttpCode(200)
  async loginUser(
    //Кастомный перехватчик id из request - который мы получаем с помощью гуарда
    @CurrentUser() userId: string,
    // { passthrough: true } для того что бы делать просто return
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokenPair = await this.commandBus.execute(new UserLoginCommand(userId));
    res.cookie('refreshToken', tokenPair.refreshToken, { httpOnly: true, secure: true });
    return {
      accessToken: tokenPair.token,
    };
  }

  @Post('registration')
  @HttpCode(204)
  async userRegistration(@Body() registrationData: UserRegistrationModel): Promise<void> {
    await this.commandBus.execute(new UserRegistrationCommand(registrationData));
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async userConfirmation(@Body() confirmationCode: ValidationCodeModel): Promise<void> {
    await this.commandBus.execute(new ChangeUserConfirmationCommand(confirmationCode.code, true));
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  async emailConfirmationResending(@Body() body: EmailResendingModel): Promise<void> {
    await this.commandBus.execute(new EmailResendingCommand(body.email));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserInformation(@CurrentUser() userId: string): Promise<AboutMeType> {
    return this.commandBus.execute(new UserGetInformationAboutMeCommand(userId));
  }
}
