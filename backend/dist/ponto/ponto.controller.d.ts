import { PontoService } from './ponto.service';
export declare class PontoController {
    private readonly pontoService;
    constructor(pontoService: PontoService);
    registrar(body: any): Promise<{
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
    listar(body: any): Promise<{
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
