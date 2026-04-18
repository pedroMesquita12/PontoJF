import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { validarAcessoTelaAdmin } from '../auth/permissions';
import {
  AdminService,
  CreateFuncionarioDto,
  UpdateFuncionarioDto,
} from './admin.service';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('ponto/funcionarios')
  async listarFuncionarios(@Req() req: any, @Query('date') date?: string) {
    validarAcessoTelaAdmin(req.user);
    const data = date || new Date().toISOString().split('T')[0];
    return this.adminService.listarFuncionariosComPonto(data);
  }

  @Get('overview')
  async obterOverview(@Req() req: any, @Query('date') date?: string) {
    validarAcessoTelaAdmin(req.user);
    const data = date || new Date().toISOString().split('T')[0];
    return this.adminService.obterOverview(data);
  }

  @Get('funcionarios/options')
  async listarOpcoes(@Req() req: any) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.listarOpcoesFuncionarios();
  }

  @Get('funcionarios')
  async listarFuncionariosCrud(@Req() req: any, @Query('search') search?: string) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.listarFuncionariosCrud(search);
  }

  @Get('funcionarios/:id')
  async obterFuncionario(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.obterFuncionarioPorId(id);
  }

  @Post('funcionarios')
  async criarFuncionario(@Req() req: any, @Body() body: CreateFuncionarioDto) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.criarFuncionario(body);
  }

  @Put('funcionarios/:id')
  async atualizarFuncionario(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFuncionarioDto,
  ) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.atualizarFuncionario(id, body);
  }

  @Patch('funcionarios/:id/status')
  async alternarStatusFuncionario(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.alternarStatusFuncionario(id);
  }

  @Delete('funcionarios/:id')
  async removerFuncionario(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.removerFuncionario(id);
  }

  @Get('atestados')
  async listarAtestados(@Req() req: any) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.listarAtestadosAdmin();
  }

  @Patch('atestados/:id/status')
  async atualizarStatusAtestado(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: 'APROVADO' | 'REJEITADO'; observacao?: string },
  ) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.atualizarStatusAtestado(id, req.user, body);
  }

  @Get('advertencias')
  async listarAdvertencias(@Req() req: any) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.listarAdvertenciasAdmin();
  }

  @Post('advertencias')
  async criarAdvertencia(
    @Req() req: any,
    @Body()
    body: {
      funcionario_id: number;
      tipo: string;
      motivo: string;
      descricao?: string;
      data_advertencia?: string;
    },
  ) {
    validarAcessoTelaAdmin(req.user);
    return this.adminService.criarAdvertencia(req.user, body);
  }
}