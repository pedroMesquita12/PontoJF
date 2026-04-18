import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);

      const allowed =
        origin.includes('.github.dev') ||
        origin.includes('.app.github.dev') ||
        origin.includes('localhost');

      if (allowed) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads',
});
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();