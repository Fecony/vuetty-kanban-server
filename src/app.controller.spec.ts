import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appService = module.get<AppService>(AppService);
    appController = module.get<AppController>(AppController);
  });

  describe('ping', () => {
    it('should return string "pong!"', async () => {
      const result = 'pong!';

      jest.spyOn(appService, 'ping').mockImplementation(() => result);

      expect(await appController.ping()).toBe(result);
    });
  });
});
