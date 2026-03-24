import { Module } from '@nestjs/common';
import { PontoController } from './ponto.controller';
import { PontoService } from './ponto.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PontoController],
  providers: [PontoService, PrismaService],
})
export class PontoModule {}
