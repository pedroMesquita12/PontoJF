import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PontoModule } from './ponto/ponto.module';
import { AuthModule } from './auth/auth.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PontoModule,
    AuthModule,
    WhatsappModule,
    PontoModule,
    AuthModule,
  ],
})
export class AppModule {}