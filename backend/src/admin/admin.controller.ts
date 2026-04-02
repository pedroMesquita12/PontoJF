import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('ponto/funcionarios')
  async listarFuncionarios(@Query('date') date?: string) {
    const data = date || new Date().toISOString().split('T')[0];
    return this.adminService.listarFuncionariosComPonto(data);
  }

  @Get('overview')
  async obterOverview(@Query('date') date?: string) {
    const data = date || new Date().toISOString().split('T')[0];
    return this.adminService.obterOverview(data);
  }
}