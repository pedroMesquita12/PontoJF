import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

/**
 * Função bootstrap responsável pela inicialização da aplicação NestJS.
 * Esta é a função principal que:
 *  Cria a instância da aplicação NestJS
 *  Configura CORS para aceitar requisições de qualquer origem
 *  Inicia o servidor na porta 3000
 */
async function bootstrap() {
  // Cria a aplicação NestJS com o AppModule como módulo raiz
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para permitir requisições de diferentes origens (configuração de desenvolvimento)
  app.enableCors({
    origin: true, // Aceita qualquer origem (ideal para desenvolvimento)
    credentials: true, // Permite envio de credenciais (cookies, headers de autenticação)
  });

  // Inicia o servidor na porta 3000
  await app.listen(3000);
}

// Executa a função de bootstrap para iniciar a aplicação
bootstrap();