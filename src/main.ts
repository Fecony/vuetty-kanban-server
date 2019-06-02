import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import * as helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

let bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  const config: ConfigService = app.get(ConfigService);
  app.use(helmet());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  await app.listen(config.get('PORT'));
  Logger.log(
    `Server running on http://localhost:${config.get('PORT')}`,
    'Bootstrap',
  );
};
bootstrap();
