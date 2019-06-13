import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from './config/config.service';
const helmet = require('helmet');
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

let bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const config: ConfigService = app.get(ConfigService);
  const PORT = config.get('PORT') || 3005;

  app.use(helmet());
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(PORT, () => {
    Logger.log(`Server running on http://localhost:${PORT}`, 'Bootstrap');
  });
};
bootstrap();
