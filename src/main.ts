/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { appSettings } from './settings/aplly-app-setting';
import { configService } from './settings/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = configService.getPort();
  console.log(`app started at port ${PORT}`);
  //Выносим неастройки для удобства тестов
  appSettings(app);
  await app.listen(PORT);
}
bootstrap();
