import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

/**
 * Controlador Administrativo (AdminController)
 * 
 * Responsabilidades:
 * - Expor endpoints de gestão e relatórios
 * - Validar parâmetros de data
 * - Delegar lógica para AdminService
 * 
 * Endpoints:
 * GET  /admin/ponto/funcionarios - Lista funcionários com ponto do dia
 * GET  /admin/overview - Overview/dashboard com estatísticas
 */
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Lista funcionários com dados de ponto para uma data específica
   * 
   * Retorna:
   * - Dados pessoais (matrícula, nome, cargo)
   * - Status atual (trabalhando, pausa, fora)
   * - Tempos (trabalhado, pausa)
   * - Histórico de pontos do dia
   * 
   * @param date - Data no formato YYYY-MM-DD (usa hoje se não informado)
   * @returns Array com funcionários e detalhes de ponto
   */
  @Get('ponto/funcionarios')
  async listarFuncionarios(@Query('date') date?: string) {
    // Usa data informada ou data atual (se não informado)
    const data = date || new Date().toISOString().split('T')[0];
    return this.adminService.listarFuncionariosComPonto(data);
  }

  /**
   * Obtém overview/dashboard com estatísticas globais
   * 
   * Retorna:
   * - Stats: Total de funcionários, status, taxa de presença
   * - Weekly data: Dados por dia da semana
   * - Top funcionários: 3 com maior carga horária
   * - Alerts: Alertas e notificações
   * 
   * @param date - Data de referência (usa hoje se não informado)
   * @returns Objeto com estatísticas e overview
   */
  @Get('overview')
  async obterOverview(@Query('date') date?: string) {
    // Usa data informada ou data atual
    const data = date || new Date().toISOString().split('T')[0];
    return this.adminService.obterOverview(data);
  }
}