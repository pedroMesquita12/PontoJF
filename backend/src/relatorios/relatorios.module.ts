import { Module } from '@nestjs/common';
import { RelatoriosController } from './relatorios.controller';
import { RelatoriosService } from './relatorios.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RelatoriosController],
  providers: [RelatoriosService, PrismaService],
})
export class RelatoriosModule {}