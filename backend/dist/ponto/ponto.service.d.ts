import { PrismaService } from '../prisma/prisma.service';
export declare class PontoService {
    private prisma;
    constructor(prisma: PrismaService);
    registrarPonto(funcionarioId: bigint, tipo: string): Promise<{
        id: bigint;
        tipo: import(".prisma/client").$Enums.tipo_registro_ponto;
        data_hora: Date;
        data_referencia: Date;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        endereco_referencia: string | null;
        ip_registro: string | null;
        dispositivo: string | null;
        navegador: string | null;
        observacao: string | null;
        origem: string | null;
        created_at: Date;
        updated_at: Date;
        funcionario_id: bigint;
    }>;
    listarPontos(funcionarioId: bigint): Promise<{
        id: bigint;
        tipo: import(".prisma/client").$Enums.tipo_registro_ponto;
        data_hora: Date;
        data_referencia: Date;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        endereco_referencia: string | null;
        ip_registro: string | null;
        dispositivo: string | null;
        navegador: string | null;
        observacao: string | null;
        origem: string | null;
        created_at: Date;
        updated_at: Date;
        funcionario_id: bigint;
    }[]>;
}
