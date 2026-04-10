import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Controlador de Autenticação (AuthController)
 * 
 * Responsabilidades:
 * - Expor endpoint de login
 * - Validar corpo da requisição
 * - Delegar lógica para AuthService
 * - Tratamento de erros
 * 
 * Endpoint:
 * POST /auth/login - Realiza autenticação com matrícula e senha
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint de login
   * 
   * Recebe matrícula e senha, valida contra banco de dados
   * e retorna dados do usuário autenticado
   * 
   * @param body - Objeto com matrícula e senha
   * @returns Dados do usuário autenticado
   * @throws UnauthorizedException - Se credenciais inválidas
   */
  @Post('login')
  async login(@Body() body: { matricula: string; senha: string }) {
    try {
      // Log de debug com dados recebidos
      console.log('BODY LOGIN:', body);
      // Delega validação e autenticação para o serviço
      return await this.authService.login(body.matricula, body.senha);
    } catch (error) {
      // Log de erro para debug e troubleshooting
      console.error('ERRO NO AUTH CONTROLLER:', error);
      // Re-lança erro para tratamento global
      throw error;
    }
  }
}