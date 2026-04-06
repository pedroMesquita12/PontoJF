"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatoriosService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var exceljs_1 = require("exceljs");
var RelatoriosService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RelatoriosService = _classThis = /** @class */ (function () {
        function RelatoriosService_1(prisma) {
            this.prisma = prisma;
        }
        RelatoriosService_1.prototype.importarRelatorioEntregas = function (file, usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var workbook, worksheet, rows, importacao, registros;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!file) {
                                throw new common_1.BadRequestException('Arquivo não enviado.');
                            }
                            if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
                                throw new common_1.BadRequestException('Apenas arquivos .xlsx são permitidos.');
                            }
                            workbook = new exceljs_1.default.Workbook();
                            return [4 /*yield*/, workbook.xlsx.load(file.buffer)];
                        case 1:
                            _a.sent();
                            worksheet = workbook.worksheets[0];
                            if (!worksheet) {
                                throw new common_1.BadRequestException('A planilha não possui abas válidas.');
                            }
                            rows = this.extrairLinhasDaPlanilha(worksheet);
                            if (!rows.length) {
                                throw new common_1.BadRequestException('Nenhum dado encontrado no arquivo.');
                            }
                            return [4 /*yield*/, this.prisma.importacoes_relatorios.create({
                                    data: {
                                        nome_arquivo: file.originalname,
                                        tipo_relatorio: client_1.tipo_relatorio.ENTREGAS,
                                        importado_por: usuarioId,
                                    },
                                })];
                        case 2:
                            importacao = _a.sent();
                            registros = rows
                                .map(function (row) {
                                return _this.mapearLinhaEntrega(row, file.originalname, importacao.id);
                            })
                                .filter(Boolean);
                            if (!registros.length) {
                                throw new common_1.BadRequestException('Nenhum registro válido de entrega foi identificado no Excel.');
                            }
                            return [4 /*yield*/, this.prisma.relatorios_entregas.createMany({
                                    data: registros,
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, {
                                    message: 'Relatório importado com sucesso.',
                                    importacaoId: importacao.id.toString(),
                                    arquivo: file.originalname,
                                    totalImportado: registros.length,
                                }];
                    }
                });
            });
        };
        RelatoriosService_1.prototype.listarRelatoriosEntregas = function (filters) {
            return __awaiter(this, void 0, void 0, function () {
                var where, entregas, totalEntregas, entregues, emRota, pendentes, canceladas;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {};
                            if (filters.cidade) {
                                where.cidade = {
                                    equals: filters.cidade,
                                    mode: 'insensitive',
                                };
                            }
                            if (filters.status) {
                                where.status = filters.status;
                            }
                            if (filters.dataInicio || filters.dataFim) {
                                where.data_entrega = {};
                                if (filters.dataInicio) {
                                    where.data_entrega.gte = new Date("".concat(filters.dataInicio, "T00:00:00"));
                                }
                                if (filters.dataFim) {
                                    where.data_entrega.lte = new Date("".concat(filters.dataFim, "T23:59:59"));
                                }
                            }
                            if (filters.busca) {
                                where.OR = [
                                    {
                                        codigo_entrega: {
                                            contains: filters.busca,
                                            mode: 'insensitive',
                                        },
                                    },
                                    {
                                        destinatario: {
                                            contains: filters.busca,
                                            mode: 'insensitive',
                                        },
                                    },
                                    {
                                        endereco: {
                                            contains: filters.busca,
                                            mode: 'insensitive',
                                        },
                                    },
                                    {
                                        cidade: {
                                            contains: filters.busca,
                                            mode: 'insensitive',
                                        },
                                    },
                                ];
                            }
                            return [4 /*yield*/, this.prisma.relatorios_entregas.findMany({
                                    where: where,
                                    orderBy: [{ data_entrega: 'desc' }, { id: 'desc' }],
                                })];
                        case 1:
                            entregas = _a.sent();
                            totalEntregas = entregas.length;
                            entregues = entregas.filter(function (e) { return e.status === 'ENTREGUE'; }).length;
                            emRota = entregas.filter(function (e) { return e.status === 'EM_ROTA'; }).length;
                            pendentes = entregas.filter(function (e) { return e.status === 'PENDENTE'; }).length;
                            canceladas = entregas.filter(function (e) { return e.status === 'CANCELADO'; }).length;
                            return [2 /*return*/, {
                                    stats: {
                                        totalEntregas: totalEntregas,
                                        entregues: entregues,
                                        emRota: emRota,
                                        pendentes: pendentes,
                                        canceladas: canceladas,
                                    },
                                    entregas: entregas.map(function (item) { return ({
                                        id: item.id.toString(),
                                        codigo: item.codigo_entrega,
                                        destinatario: item.destinatario,
                                        endereco: item.endereco,
                                        bairro: item.bairro,
                                        cidade: item.cidade,
                                        estado: item.estado,
                                        dataEntrega: item.data_entrega,
                                        horarioEntrega: item.horario_entrega,
                                        status: item.status,
                                        valorEntrega: item.valor_entrega,
                                        observacoes: item.observacoes,
                                        origemArquivo: item.origem_arquivo,
                                    }); }),
                                }];
                    }
                });
            });
        };
        RelatoriosService_1.prototype.listarCidadesEntregas = function () {
            return __awaiter(this, void 0, void 0, function () {
                var cidades;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.relatorios_entregas.findMany({
                                where: {
                                    cidade: {
                                        not: null,
                                    },
                                },
                                select: {
                                    cidade: true,
                                },
                                distinct: ['cidade'],
                                orderBy: {
                                    cidade: 'asc',
                                },
                            })];
                        case 1:
                            cidades = _a.sent();
                            return [2 /*return*/, cidades
                                    .map(function (item) { return item.cidade; })
                                    .filter(function (cidade) { return Boolean(cidade); })];
                    }
                });
            });
        };
        RelatoriosService_1.prototype.extrairLinhasDaPlanilha = function (worksheet) {
            var _this = this;
            var linhas = [];
            worksheet.eachRow(function (row) {
                var valores = Array.isArray(row.values) ? row.values.slice(1) : [];
                linhas.push(valores);
            });
            var headerIndex = this.encontrarLinhaCabecalho(linhas);
            if (headerIndex === -1) {
                throw new common_1.BadRequestException('Não foi possível localizar o cabeçalho da planilha.');
            }
            var headers = linhas[headerIndex].map(function (cell) {
                return _this.normalizarCabecalho(cell);
            });
            var dataRows = linhas.slice(headerIndex + 1);
            return dataRows
                .map(function (row) {
                var obj = {};
                headers.forEach(function (header, index) {
                    var _a;
                    if (!header)
                        return;
                    obj[header] = (_a = row[index]) !== null && _a !== void 0 ? _a : null;
                });
                return obj;
            })
                .filter(function (row) {
                return Object.values(row).some(function (value) { return value !== null && String(value).trim() !== ''; });
            });
        };
        RelatoriosService_1.prototype.encontrarLinhaCabecalho = function (linhas) {
            var _this = this;
            var aliases = [
                'id da entrega',
                'codigo',
                'código',
                'data da entrega',
                'data entrega',
                'status',
                'cidade',
                'destinatario',
                'destinatário',
                'cliente',
            ];
            var _loop_1 = function (i) {
                var linhaNormalizada = (linhas[i] || []).map(function (cell) {
                    return _this.normalizarCabecalho(cell);
                });
                var encontrou = aliases.some(function (alias) {
                    return linhaNormalizada.includes(_this.normalizarCabecalho(alias));
                });
                if (encontrou) {
                    return { value: i };
                }
            };
            for (var i = 0; i < linhas.length; i++) {
                var state_1 = _loop_1(i);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            return -1;
        };
        RelatoriosService_1.prototype.mapearLinhaEntrega = function (row, nomeArquivo, importacaoId) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            var codigoEntrega = (_a = this.getValue(row, ['id da entrega', 'codigo', 'código', 'entrega', 'nº'])) !== null && _a !== void 0 ? _a : null;
            var destinatario = (_b = this.getValue(row, [
                'destinatario',
                'destinatário',
                'cliente',
                'nome',
            ])) !== null && _b !== void 0 ? _b : null;
            var endereco = (_c = this.getValue(row, ['endereco', 'endereço', 'logradouro'])) !== null && _c !== void 0 ? _c : null;
            var bairro = (_d = this.getValue(row, ['bairro'])) !== null && _d !== void 0 ? _d : null;
            var cidadePlanilha = (_e = this.getValue(row, ['cidade', 'municipio', 'município'])) !== null && _e !== void 0 ? _e : null;
            var estado = (_f = this.getValue(row, ['uf', 'estado'])) !== null && _f !== void 0 ? _f : null;
            var dataEntregaRaw = (_g = this.getValue(row, ['data da entrega', 'data entrega', 'data'])) !== null && _g !== void 0 ? _g : null;
            var horarioEntregaRaw = (_h = this.getValue(row, ['horario', 'horário', 'hora'])) !== null && _h !== void 0 ? _h : null;
            var statusRaw = (_j = this.getValue(row, ['status', 'situacao', 'situação'])) !== null && _j !== void 0 ? _j : null;
            var valorRaw = (_k = this.getValue(row, ['valor da entrega', 'valor', 'preco', 'preço'])) !== null && _k !== void 0 ? _k : null;
            var observacoes = (_l = this.getValue(row, ['observacoes', 'observações', 'obs'])) !== null && _l !== void 0 ? _l : null;
            var cidade = cidadePlanilha ||
                this.extrairCidadeDoEndereco(endereco) ||
                this.extrairCidadeDoNomeArquivo(nomeArquivo) ||
                null;
            var status = this.normalizarStatusEntrega(statusRaw);
            var dataEntrega = this.parseExcelDateOnly(dataEntregaRaw);
            var horarioEntrega = this.parseExcelTimeOnly(horarioEntregaRaw);
            var valorEntrega = this.parseDecimal(valorRaw);
            var existeConteudoMinimo = codigoEntrega || destinatario || endereco || cidade || dataEntrega;
            if (!existeConteudoMinimo) {
                return null;
            }
            return {
                importacao_id: importacaoId,
                codigo_entrega: codigoEntrega ? String(codigoEntrega).trim() : null,
                destinatario: destinatario ? String(destinatario).trim() : null,
                endereco: endereco ? String(endereco).trim() : null,
                bairro: bairro ? String(bairro).trim() : null,
                cidade: cidade ? String(cidade).trim() : null,
                estado: estado ? String(estado).trim().toUpperCase() : null,
                data_entrega: dataEntrega,
                horario_entrega: horarioEntrega,
                status: status,
                valor_entrega: valorEntrega,
                observacoes: observacoes ? String(observacoes).trim() : null,
                origem_arquivo: nomeArquivo,
            };
        };
        RelatoriosService_1.prototype.getValue = function (row, keys) {
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                if (row[key] !== undefined &&
                    row[key] !== null &&
                    String(row[key]).trim() !== '') {
                    return row[key];
                }
            }
            return null;
        };
        RelatoriosService_1.prototype.normalizarCabecalho = function (value) {
            if (value === null || value === undefined)
                return '';
            return String(value)
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
        };
        RelatoriosService_1.prototype.normalizarStatusEntrega = function (value) {
            if (!value)
                return null;
            var normalized = String(value)
                .trim()
                .toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            if (normalized.includes('ENTREGUE'))
                return 'ENTREGUE';
            if (normalized.includes('ROTA'))
                return 'EM_ROTA';
            if (normalized.includes('PENDENTE'))
                return 'PENDENTE';
            if (normalized.includes('CANCEL'))
                return 'CANCELADO';
            return null;
        };
        RelatoriosService_1.prototype.extrairCidadeDoNomeArquivo = function (nomeArquivo) {
            var nome = nomeArquivo
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
            if (nome.includes('ourinhos'))
                return 'Ourinhos';
            if (nome.includes('chapeco'))
                return 'Chapecó';
            return null;
        };
        RelatoriosService_1.prototype.extrairCidadeDoEndereco = function (endereco) {
            if (!endereco)
                return null;
            var texto = endereco
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
            if (texto.includes('ourinhos'))
                return 'Ourinhos';
            if (texto.includes('chapeco'))
                return 'Chapecó';
            return null;
        };
        RelatoriosService_1.prototype.parseExcelDateOnly = function (value) {
            if (!value)
                return null;
            if (value instanceof Date) {
                return value;
            }
            if (typeof value === 'number') {
                var excelEpoch = new Date(Date.UTC(1899, 11, 30));
                var date = new Date(excelEpoch.getTime() + value * 86400000);
                return new Date("".concat(date.getUTCFullYear(), "-").concat(String(date.getUTCMonth() + 1).padStart(2, '0'), "-").concat(String(date.getUTCDate()).padStart(2, '0'), "T00:00:00"));
            }
            var texto = String(value).trim();
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
                var _a = texto.split('/'), dia = _a[0], mes = _a[1], ano = _a[2];
                return new Date("".concat(ano, "-").concat(mes, "-").concat(dia, "T00:00:00"));
            }
            var parsed = new Date(texto);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        };
        RelatoriosService_1.prototype.parseExcelTimeOnly = function (value) {
            if (!value)
                return null;
            if (value instanceof Date) {
                return value;
            }
            if (typeof value === 'number') {
                var totalSeconds = Math.round(value * 24 * 60 * 60);
                var hours = Math.floor(totalSeconds / 3600)
                    .toString()
                    .padStart(2, '0');
                var minutes = Math.floor((totalSeconds % 3600) / 60)
                    .toString()
                    .padStart(2, '0');
                var seconds = Math.floor(totalSeconds % 60)
                    .toString()
                    .padStart(2, '0');
                return new Date("1970-01-01T".concat(hours, ":").concat(minutes, ":").concat(seconds));
            }
            var texto = String(value).trim();
            if (/^\d{2}:\d{2}(:\d{2})?$/.test(texto)) {
                return new Date("1970-01-01T".concat(texto.length === 5 ? "".concat(texto, ":00") : texto));
            }
            return null;
        };
        RelatoriosService_1.prototype.parseDecimal = function (value) {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            if (typeof value === 'number') {
                return new client_1.Prisma.Decimal(value);
            }
            var texto = String(value)
                .replace(/\./g, '')
                .replace(',', '.')
                .replace(/[^\d.-]/g, '');
            if (!texto)
                return null;
            var numero = Number(texto);
            if (Number.isNaN(numero)) {
                return null;
            }
            return new client_1.Prisma.Decimal(numero);
        };
        return RelatoriosService_1;
    }());
    __setFunctionName(_classThis, "RelatoriosService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RelatoriosService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RelatoriosService = _classThis;
}();
exports.RelatoriosService = RelatoriosService;
