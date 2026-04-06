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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
var common_1 = require("@nestjs/common");
var AdminService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AdminService = _classThis = /** @class */ (function () {
        function AdminService_1(prisma) {
            this.prisma = prisma;
        }
        AdminService_1.prototype.getStartOfDay = function (dateString) {
            return new Date("".concat(dateString, "T00:00:00"));
        };
        AdminService_1.prototype.getEndOfDay = function (dateString) {
            return new Date("".concat(dateString, "T23:59:59.999"));
        };
        AdminService_1.prototype.getStartOfWeek = function (date) {
            var d = new Date(date);
            var day = d.getDay(); // 0 domingo, 1 segunda...
            var diff = day === 0 ? -6 : 1 - day; // semana começando na segunda
            d.setDate(d.getDate() + diff);
            d.setHours(0, 0, 0, 0);
            return d;
        };
        AdminService_1.prototype.getEndOfWeek = function (date) {
            var start = this.getStartOfWeek(date);
            var end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            return end;
        };
        AdminService_1.prototype.formatMinutes = function (totalMinutes) {
            var safe = Math.max(0, Math.floor(totalMinutes));
            var hours = Math.floor(safe / 60);
            var minutes = safe % 60;
            return "".concat(String(hours).padStart(2, '0'), "h ").concat(String(minutes).padStart(2, '0'), "min");
        };
        AdminService_1.prototype.diffInMinutes = function (start, end) {
            return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
        };
        AdminService_1.prototype.mapTipo = function (tipo) {
            switch (tipo) {
                case 'ENTRADA':
                    return 'entrada';
                case 'SAIDA':
                    return 'saida';
                case 'SAIDA_ALMOCO':
                    return 'pausa_inicio';
                case 'VOLTA_ALMOCO':
                    return 'pausa_fim';
                default:
                    return 'entrada';
            }
        };
        AdminService_1.prototype.formatTime = function (date) {
            return new Intl.DateTimeFormat('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'America/Sao_Paulo',
            }).format(date);
        };
        AdminService_1.prototype.calcularResumo = function (registros) {
            if (!registros.length) {
                return {
                    status: 'fora',
                    horasTrabalhadas: 0,
                    horasPausa: 0,
                    ultimaEntrada: '-',
                    ultimaSaida: '-',
                };
            }
            var trabalhoMin = 0;
            var pausaMin = 0;
            var inicioTrabalho = null;
            var inicioPausa = null;
            var ultimaEntrada = '-';
            var ultimaSaida = '-';
            for (var _i = 0, registros_1 = registros; _i < registros_1.length; _i++) {
                var registro = registros_1[_i];
                var dataHora = registro.data_hora;
                switch (registro.tipo) {
                    case 'ENTRADA':
                        inicioTrabalho = dataHora;
                        ultimaEntrada = this.formatTime(dataHora);
                        break;
                    case 'SAIDA_ALMOCO':
                        if (inicioTrabalho) {
                            trabalhoMin += this.diffInMinutes(inicioTrabalho, dataHora);
                            inicioTrabalho = null;
                        }
                        inicioPausa = dataHora;
                        ultimaSaida = this.formatTime(dataHora);
                        break;
                    case 'VOLTA_ALMOCO':
                        if (inicioPausa) {
                            pausaMin += this.diffInMinutes(inicioPausa, dataHora);
                            inicioPausa = null;
                        }
                        inicioTrabalho = dataHora;
                        ultimaEntrada = this.formatTime(dataHora);
                        break;
                    case 'SAIDA':
                        if (inicioTrabalho) {
                            trabalhoMin += this.diffInMinutes(inicioTrabalho, dataHora);
                            inicioTrabalho = null;
                        }
                        ultimaSaida = this.formatTime(dataHora);
                        break;
                }
            }
            var ultimoRegistro = registros[registros.length - 1];
            var status = 'fora';
            if (ultimoRegistro) {
                if (ultimoRegistro.tipo === 'ENTRADA' ||
                    ultimoRegistro.tipo === 'VOLTA_ALMOCO') {
                    status = 'trabalhando';
                }
                else if (ultimoRegistro.tipo === 'SAIDA_ALMOCO') {
                    status = 'pausa';
                }
                else {
                    status = 'fora';
                }
            }
            return {
                status: status,
                horasTrabalhadas: trabalhoMin,
                horasPausa: pausaMin,
                ultimaEntrada: ultimaEntrada,
                ultimaSaida: ultimaSaida,
            };
        };
        AdminService_1.prototype.listarFuncionariosComPonto = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var inicioDia, fimDia, inicioSemana, fimSemana, funcionarios, funcionarioIds, registrosSemana;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            inicioDia = this.getStartOfDay(data);
                            fimDia = this.getEndOfDay(data);
                            inicioSemana = this.getStartOfWeek(inicioDia);
                            fimSemana = this.getEndOfWeek(inicioDia);
                            return [4 /*yield*/, this.prisma.funcionarios.findMany({
                                    where: {
                                        status: 'ATIVO',
                                    },
                                    include: {
                                        usuarios: true,
                                        cargos: true,
                                    },
                                    orderBy: {
                                        matricula: 'asc',
                                    },
                                })];
                        case 1:
                            funcionarios = _a.sent();
                            funcionarioIds = funcionarios.map(function (f) { return f.id; });
                            return [4 /*yield*/, this.prisma.registros_ponto.findMany({
                                    where: {
                                        funcionario_id: {
                                            in: funcionarioIds,
                                        },
                                        data_hora: {
                                            gte: inicioSemana,
                                            lte: fimSemana,
                                        },
                                    },
                                    orderBy: {
                                        data_hora: 'asc',
                                    },
                                })];
                        case 2:
                            registrosSemana = _a.sent();
                            return [2 /*return*/, funcionarios.map(function (f) {
                                    var _a, _b;
                                    var registrosDoFuncionario = registrosSemana.filter(function (r) { return String(r.funcionario_id) === String(f.id); });
                                    var registrosDia = registrosDoFuncionario.filter(function (r) {
                                        return r.data_hora >= inicioDia && r.data_hora <= fimDia;
                                    });
                                    var resumoDia = _this.calcularResumo(registrosDia);
                                    var resumoSemana = _this.calcularResumo(registrosDoFuncionario);
                                    return {
                                        id: String(f.id),
                                        matricula: f.matricula,
                                        nome: f.usuarios.nome,
                                        cargo: (_b = (_a = f.cargos) === null || _a === void 0 ? void 0 : _a.nome) !== null && _b !== void 0 ? _b : 'Funcionário',
                                        cpf: f.cpf,
                                        status: resumoDia.status,
                                        horasTrabalhadas: _this.formatMinutes(resumoDia.horasTrabalhadas),
                                        horasSemanais: _this.formatMinutes(resumoSemana.horasTrabalhadas),
                                        horasPausa: _this.formatMinutes(resumoDia.horasPausa),
                                        ultimaEntrada: resumoDia.ultimaEntrada,
                                        ultimaSaida: resumoDia.ultimaSaida,
                                        entradas: registrosDia.map(function (r) { return ({
                                            id: String(r.id),
                                            type: _this.mapTipo(r.tipo),
                                            timestamp: _this.formatTime(r.data_hora),
                                        }); }),
                                    };
                                })];
                    }
                });
            });
        };
        AdminService_1.prototype.getDateLabel = function (date) {
            return new Intl.DateTimeFormat('pt-BR', {
                weekday: 'short',
                timeZone: 'America/Sao_Paulo',
            })
                .format(date)
                .replace('.', '');
        };
        AdminService_1.prototype.getMonthStart = function (date) {
            var d = new Date(date);
            d.setDate(1);
            d.setHours(0, 0, 0, 0);
            return d;
        };
        AdminService_1.prototype.contarStatus = function (registros) {
            if (!registros.length)
                return 'fora';
            var ultimo = registros[registros.length - 1];
            if (ultimo.tipo === 'ENTRADA' || ultimo.tipo === 'VOLTA_ALMOCO') {
                return 'trabalhando';
            }
            if (ultimo.tipo === 'SAIDA_ALMOCO') {
                return 'pausa';
            }
            return 'fora';
        };
        AdminService_1.prototype.obterOverview = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var inicioDia, fimDia, inicioSemana, fimSemana, inicioMes, funcionarios, funcionarioIds, registrosSemana, registrosDia, registrosMes, trabalhando, emPausa, fora, topFuncionarios, totalFuncionarios, comRegistroHoje, taxaPresenca, weeklyData, _loop_1, this_1, i, top3, funcionariosSemRegistroHoje, alerts;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            inicioDia = this.getStartOfDay(data);
                            fimDia = this.getEndOfDay(data);
                            inicioSemana = this.getStartOfWeek(inicioDia);
                            fimSemana = this.getEndOfWeek(inicioDia);
                            inicioMes = this.getMonthStart(inicioDia);
                            return [4 /*yield*/, this.prisma.funcionarios.findMany({
                                    where: {
                                        status: 'ATIVO',
                                    },
                                    include: {
                                        usuarios: true,
                                        cargos: true,
                                    },
                                    orderBy: {
                                        matricula: 'asc',
                                    },
                                })];
                        case 1:
                            funcionarios = _a.sent();
                            funcionarioIds = funcionarios.map(function (f) { return f.id; });
                            return [4 /*yield*/, this.prisma.registros_ponto.findMany({
                                    where: {
                                        funcionario_id: { in: funcionarioIds },
                                        data_hora: {
                                            gte: inicioSemana,
                                            lte: fimSemana,
                                        },
                                    },
                                    orderBy: {
                                        data_hora: 'asc',
                                    },
                                })];
                        case 2:
                            registrosSemana = _a.sent();
                            registrosDia = registrosSemana.filter(function (r) { return r.data_hora >= inicioDia && r.data_hora <= fimDia; });
                            return [4 /*yield*/, this.prisma.registros_ponto.findMany({
                                    where: {
                                        funcionario_id: { in: funcionarioIds },
                                        data_hora: {
                                            gte: inicioMes,
                                            lte: fimDia,
                                        },
                                    },
                                    orderBy: {
                                        data_hora: 'asc',
                                    },
                                })];
                        case 3:
                            registrosMes = _a.sent();
                            trabalhando = 0;
                            emPausa = 0;
                            fora = 0;
                            topFuncionarios = funcionarios.map(function (f) {
                                var _a, _b;
                                var registrosFuncSemana = registrosSemana.filter(function (r) { return String(r.funcionario_id) === String(f.id); });
                                var registrosFuncDia = registrosDia.filter(function (r) { return String(r.funcionario_id) === String(f.id); });
                                var resumoDia = _this.calcularResumo(registrosFuncDia);
                                var resumoSemana = _this.calcularResumo(registrosFuncSemana);
                                var status = _this.contarStatus(registrosFuncDia);
                                if (status === 'trabalhando')
                                    trabalhando++;
                                else if (status === 'pausa')
                                    emPausa++;
                                else
                                    fora++;
                                return {
                                    nome: f.usuarios.nome,
                                    cargo: (_b = (_a = f.cargos) === null || _a === void 0 ? void 0 : _a.nome) !== null && _b !== void 0 ? _b : 'Funcionário',
                                    horasSemanaMin: resumoSemana.horasTrabalhadas,
                                    horasDiaMin: resumoDia.horasTrabalhadas,
                                };
                            });
                            totalFuncionarios = funcionarios.length;
                            comRegistroHoje = new Set(registrosDia.map(function (r) { return String(r.funcionario_id); })).size;
                            taxaPresenca = totalFuncionarios > 0 ? Number(((comRegistroHoje / totalFuncionarios) * 100).toFixed(1)) : 0;
                            weeklyData = [];
                            _loop_1 = function (i) {
                                var dia = new Date(inicioSemana);
                                dia.setDate(inicioSemana.getDate() + i);
                                var inicio = new Date(dia);
                                inicio.setHours(0, 0, 0, 0);
                                var fim = new Date(dia);
                                fim.setHours(23, 59, 59, 999);
                                var registrosDiaSemana = registrosSemana.filter(function (r) { return r.data_hora >= inicio && r.data_hora <= fim; });
                                var horasDia = funcionarios.reduce(function (acc, f) {
                                    var regs = registrosDiaSemana.filter(function (r) { return String(r.funcionario_id) === String(f.id); });
                                    var resumo = _this.calcularResumo(regs);
                                    return acc + resumo.horasTrabalhadas;
                                }, 0);
                                var presentes = new Set(registrosDiaSemana.map(function (r) { return String(r.funcionario_id); })).size;
                                weeklyData.push({
                                    dia: this_1.getDateLabel(dia),
                                    funcionarios: presentes,
                                    horas: Math.round(horasDia / 60),
                                });
                            };
                            this_1 = this;
                            for (i = 0; i < 6; i++) {
                                _loop_1(i);
                            }
                            top3 = __spreadArray([], topFuncionarios, true).sort(function (a, b) { return b.horasSemanaMin - a.horasSemanaMin; })
                                .slice(0, 3)
                                .map(function (f) { return ({
                                nome: f.nome,
                                cargo: f.cargo,
                                horasSemana: _this.formatMinutes(f.horasSemanaMin),
                                horasDia: _this.formatMinutes(f.horasDiaMin),
                            }); });
                            funcionariosSemRegistroHoje = funcionarios.filter(function (f) { return !registrosDia.some(function (r) { return String(r.funcionario_id) === String(f.id); }); });
                            alerts = __spreadArray(__spreadArray([], (funcionariosSemRegistroHoje.length > 0
                                ? [
                                    {
                                        id: '1',
                                        type: 'warning',
                                        message: "".concat(funcionariosSemRegistroHoje.length, " funcion\u00E1rio(s) sem registro hoje"),
                                        time: 'Hoje',
                                    },
                                ]
                                : []), true), [
                                {
                                    id: '2',
                                    type: 'info',
                                    message: "".concat(comRegistroHoje, " funcion\u00E1rio(s) registraram ponto hoje"),
                                    time: 'Hoje',
                                },
                                {
                                    id: '3',
                                    type: 'success',
                                    message: "Taxa de presen\u00E7a atual: ".concat(taxaPresenca, "%"),
                                    time: 'Hoje',
                                },
                            ], false);
                            return [2 /*return*/, {
                                    stats: {
                                        totalFuncionarios: totalFuncionarios,
                                        trabalhando: trabalhando,
                                        emPausa: emPausa,
                                        fora: fora,
                                        taxaPresenca: taxaPresenca,
                                        registrosHoje: registrosDia.length,
                                        registrosMes: registrosMes.length,
                                    },
                                    weeklyData: weeklyData,
                                    topFuncionarios: top3,
                                    alerts: alerts,
                                }];
                    }
                });
            });
        };
        return AdminService_1;
    }());
    __setFunctionName(_classThis, "AdminService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdminService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdminService = _classThis;
}();
exports.AdminService = AdminService;
