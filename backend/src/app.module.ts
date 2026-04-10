import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PontoModule } from './ponto/ponto.module';
import { AuthModule } from './auth/auth.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AdminModule } from './admin/admin.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

/**
 * Módulo raiz da aplicação (AppModule)
 * 
 * Responsabilidades:
 * - Importa todos os módulos principais da aplicação
 * - Configura variáveis de ambiente (ConfigModule)
 * - Organiza a estrutura de dependências entre módulos
 * 
 * Módulos importados:
 *  ConfigModule: Gerencia variáveis de ambiente (.env)
 *  PontoModule: Controla registros de ponto (entrada/saída)
 *  RelatoriosModule: Gera relatórios de ponto e entregas
 *  AuthModule: Autenticação e autorização de usuários
 *  WhatsappModule: Integração com WhatsApp
 *  AdminModule: Funcionalidades administrativas
 */
@Module({
  imports: [
    // Carrega configurações globais do arquivo .env
    ConfigModule.forRoot({
      isGlobal: true, // Disponibiliza as variáveis em toda a aplicação
    }),
    // Módulo para registrar pontos de entrada/saída de funcionários
    PontoModule,
    // Módulo para gerar relatórios diversos
    RelatoriosModule,
    // Módulo para autenticação e gestão de usuários
    AuthModule,
    // Módulo para integração com WhatsApp
    WhatsappModule,
    // Módulo com funcionalidades administrativas
    AdminModule,
  ],
})
export class AppModule {}