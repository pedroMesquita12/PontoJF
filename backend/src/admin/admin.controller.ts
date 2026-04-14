import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { validarAcessoTelaAdmin } from '../auth/permissions';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('ponto/funcionarios')
  async listarFuncionarios(@Req() req: any, @Query('date') date?: string) {
    console.log('REQ.USER PONTO FUNCIONARIOS:', req.user);
    validarAcessoTelaAdmin(req.user);

    const data = date || new Date().toISOString().split('T')[0];
    return this.adminService.listarFuncionariosComPonto(data);
  }

  @Get('overview')
  async obterOverview(@Req() req: any, @Query('date') date?: string) {
    console.log('REQ.USER ADMIN OVERVIEW:', req.user);
    validarAcessoTelaAdmin(req.user);

    const data = date || new Date().toISOString().split('T')[0];
    return this.adminService.obterOverview(data);
  }
}