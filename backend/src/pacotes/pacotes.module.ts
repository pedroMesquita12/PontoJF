import { Module } from '@nestjs/common';
import { PacotesController } from './pacotes.controller';
import { PacotesService } from './pacotes.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PacotesController],
  providers: [PacotesService, PrismaService],
})
export class PacotesModule {}