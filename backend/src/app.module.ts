import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PontoModule } from './ponto/ponto.module';
import { AuthModule } from './auth/auth.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AdminModule } from './admin/admin.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { PacotesModule } from './pacotes/pacotes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PontoModule,
    RelatoriosModule,
    PacotesModule,
    AuthModule,
    WhatsappModule,
    AdminModule,
  ],
})
export class AppModule {}