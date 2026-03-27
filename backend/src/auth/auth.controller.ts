import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { matricula: string; senha: string }) {
    try {
      console.log('BODY LOGIN:', body);
      return await this.authService.login(body.matricula, body.senha);
    } catch (error) {
      console.error('ERRO NO AUTH CONTROLLER:', error);
      throw error;
    }
  }
}