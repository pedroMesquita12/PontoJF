import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { PontoService } from './ponto.service';

/**
 * Tipo para o corpo da requisição de registro de ponto
 * Define os dados esperados ao registrar entrada/saída
 */
type RegistrarPontoBody = {
  funcionarioId: number | string;  // ID do funcionário (pode vir como string do frontend)
  tipo: string;                     // Tipo de ponto: 'entrada' ou 'saída'
  latitude?: number | string;       // Coordenada de latitude (opcional)
  longitude?: number | string;      // Coordenada de longitude (opcional)
  accuracy?: number | string;       // Precisão da localização em metros (opcional)
};

/**
 * Controlador de Ponto (PontoController)
 * 
 * Responsabilidades:
 * - Validar requisições de registro de ponto
 * - Converter tipos de dados (string para number)
 * - Delegar operações ao PontoService
 * - Retornar respostas ao cliente
 * 
 * Endpoints:
 * POST   /ponto/registrar - Registra entrada/saída de funcionário
 * GET    /ponto/:funcionarioId - Lista pontos de um funcionário
 */
@Controller('ponto')
export class PontoController {
  constructor(private readonly pontoService: PontoService) {}

  /**
   * Registra um ponto (entrada ou saída) para um funcionário
   * @param body - Dados do ponto a registrar (funcionarioId, tipo, coordenadas)
   * @returns Resultado do registro no banco de dados
   * @throws BadRequestException - Se dados obrigatórios estiverem ausentes ou inválidos
   */
  @Post('registrar')
  registrar(
    @Body()
    body: {
      funcionarioId: number;      // ID do funcionário que está registrando
      tipo: string;                // 'entrada' ou 'saída'
      latitude?: number;           // Latitude da localização (opcional)
      longitude?: number;          // Longitude da localização (opcional)
      accuracy?: number;           // Precisão do GPS em metros (opcional)
    },
  ) {
    // Log para debug - registra a requisição recebida
    console.log('=== POST /ponto/registrar ===');
    console.log('BODY PONTO:', body);

    // Converte funcionarioId para número (pode vir como string do frontend)
    const funcionarioId = Number(body.funcionarioId);
    // Converte latitude para número, ou undefined se não fornecida
    const latitude = body.latitude != null ? Number(body.latitude) : undefined;
    // Converte longitude para número, ou undefined se não fornecida
    const longitude = body.longitude != null ? Number(body.longitude) : undefined;
    // Converte accuracy para número, ou undefined se não fornecida
    const accuracy = body.accuracy != null ? Number(body.accuracy) : undefined;

    // Validação: Verifica se tipo foi fornecido e se funcionarioId é um número válido
    if (!body.tipo || Number.isNaN(funcionarioId)) {
      throw new BadRequestException('funcionarioId ou tipo inválido');
    }

    // Delega o registro do ponto para o serviço
    return this.pontoService.registrarPonto(
      funcionarioId,
      body.tipo,
      latitude,
      longitude,
      accuracy,
    );
  }

  /**
   * Lista todos os pontos registrados de um funcionário
   * @param funcionarioId - ID do funcionário (obtido da URL)
   * @returns Array com histórico de pontos do funcionário
   * @throws BadRequestException - Se funcionarioId não for um número válido
   */
  @Get(':funcionarioId')
  listar(@Param('funcionarioId') funcionarioId: string) {
    // Log para debug - registra a requisição recebida
    console.log('=== GET /ponto/:funcionarioId ===');
    console.log('PARAM PONTO:', funcionarioId);

    // Converte o ID do parâmetro para número
    const id = Number(funcionarioId);

    // Validação: Verifica se o ID é um número válido
    if (Number.isNaN(id)) {
      throw new BadRequestException('funcionarioId inválido');
    }

    // Delega a busca dos pontos para o serviço
    return this.pontoService.listarPontos(id);
  }
}