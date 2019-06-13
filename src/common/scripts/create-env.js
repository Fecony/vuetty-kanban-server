const fs = require('fs');
fs.writeFileSync(
  './.env',
  `
    PORT=${process.env.PORT}\n
    MONGO_URL=${process.env.MONGO_URL}\n
    JWT_SECRET=${process.env.JWT_SECRET}\n
  `,
);
