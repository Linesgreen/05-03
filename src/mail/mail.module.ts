import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

import { configService } from '../settings/config.service';
import { MailService } from './mail.service';
const user = configService.getGmailUser();
const pass = configService.getGmailPass();
//TODO вынести в env
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        port: 587,
        secure: false,
        auth: {
          user: user,
          pass: pass,
        },
      },
      defaults: {
        from: 'Vlad_Nyah <linesgreenTest@gmail.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule {}
