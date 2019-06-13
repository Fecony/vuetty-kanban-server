import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor(filePath: string) {
    fs.writeFileSync(
      './.env',
      `
        PORT=${process.env.PORT}\n
        MONGO_URL=${process.env.MONGO_URL}\n
        JWT_SECRET=${process.env.JWT_SECRET}\n
      `,
    );
    this.envConfig = dotenv.parse(fs.readFileSync(filePath));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
