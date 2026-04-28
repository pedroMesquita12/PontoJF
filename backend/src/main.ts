import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import "dotenv/config";

function getAllowedOrigins() {
  return (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const allowedOrigins = getAllowedOrigins();

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);

      const isDevelopment = process.env.NODE_ENV !== "production";
      const isDevOrigin =
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes(".github.dev") ||
        origin.includes(".app.github.dev");

      if (allowedOrigins.includes(origin) || (isDevelopment && isDevOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origem não permitida pelo CORS: ${origin}`), false);
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.listen(process.env.PORT || 3000, "0.0.0.0");
}

bootstrap();
