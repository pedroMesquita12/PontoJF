import { Module } from '@nestjs/common';
import { PontoModule } from './ponto/ponto.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PontoModule, AuthModule],
})
export class AppModule {}