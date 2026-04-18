import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, WhatsappService],
})
export class AdminModule {}