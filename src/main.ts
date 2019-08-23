import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import 'dotenv/config';
const helmet = require('helmet');

if (process.env.NODE_ENV === 'test') {
  process.env.MONGO_URL = process.env.MONGO_URL_TEST;
  console.log('----------TESTING IN PROCESS----------');
  console.log('using database', process.env.MONGO_URL);
}

let bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const PORT = process.env.PORT || 3005;

  app.use(helmet());
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(PORT, () => {
    Logger.log(
      `Server running on http://localhost:${PORT}`,
      'UserNotification',
    );
  });
};
bootstrap();
