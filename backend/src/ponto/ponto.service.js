"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.PontoService = void 0;
var common_1 = require("@nestjs/common");
var PontoService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PontoService = _classThis = /** @class */ (function () {
        function PontoService_1(prisma, whatsappService) {
            this.prisma = prisma;
            this.whatsappService = whatsappService;
            // Troque pelas coordenadas exatas copiadas do pin do Google Maps.
            // Não preenchi coordenadas novas aqui para não inventar valores.
            this.locaisPermitidos = [
                {
                    nome: 'Unidade 1 - Rua Abuassali Abujamra, 209',
                    latitude: -22.9768652,
                    longitude: -49.8795224,
                    raio: 300,
                },
                {
                    nome: 'Unidade 2 - Rua Amazonas, 530',
                    latitude: -22.974029,
                    longitude: -49.868587,
                    raio: 300,
                },
            ];
        }
        PontoService_1.prototype.formatarDuracao = function (ms) {
            if (ms <= 0)
                return '0min';
            var totalMinutos = Math.floor(ms / 1000 / 60);
            var horas = Math.floor(totalMinutos / 60);
            var minutos = totalMinutos % 60;
            if (horas === 0)
                return "".concat(minutos, "min");
            if (minutos === 0)
                return "".concat(horas, "h");
            return "".concat(horas, "h ").concat(minutos, "min");
        };
        PontoService_1.prototype.normalizarCoordenada = function (valor, tipo) {
            var numero = Number(valor);
            if (!Number.isFinite(numero)) {
                throw new common_1.BadRequestException("".concat(tipo, " inv\u00E1lida"));
            }
            if (tipo === 'latitude' && (numero < -90 || numero > 90)) {
                throw new common_1.BadRequestException('Latitude fora do intervalo válido');
            }
            if (tipo === 'longitude' && (numero < -180 || numero > 180)) {
                throw new common_1.BadRequestException('Longitude fora do intervalo válido');
            }
            return Number(numero.toFixed(8));
        };
        PontoService_1.prototype.validarCoordenadas = function (latitude, longitude) {
            if (latitude == null || longitude == null) {
                throw new common_1.BadRequestException('Localização não informada');
            }
            var lat = this.normalizarCoordenada(latitude, 'latitude');
            var lng = this.normalizarCoordenada(longitude, 'longitude');
            return { lat: lat, lng: lng };
        };
        PontoService_1.prototype.calcularDistancia = function (lat1, lon1, lat2, lon2) {
            var R = 6371000;
            var toRad = function (value) { return (value * Math.PI) / 180; };
            var dLat = toRad(lat2 - lat1);
            var dLon = toRad(lon2 - lon1);
            var a = Math.pow(Math.sin(dLat / 2), 2) +
                Math.cos(toRad(lat1)) *
                    Math.cos(toRad(lat2)) *
                    Math.pow(Math.sin(dLon / 2), 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };
        PontoService_1.prototype.encontrarLocalMaisProximo = function (latitude, longitude) {
            var localMaisProximo = null;
            var menorDistancia = Infinity;
            for (var _i = 0, _a = this.locaisPermitidos; _i < _a.length; _i++) {
                var local = _a[_i];
                var distancia = this.calcularDistancia(latitude, longitude, local.latitude, local.longitude);
                if (distancia < menorDistancia) {
                    menorDistancia = distancia;
                    localMaisProximo = local;
                }
            }
            return {
                local: localMaisProximo,
                distancia: menorDistancia,
            };
        };
        PontoService_1.prototype.montarLinkMapa = function (latitude, longitude) {
            return "https://www.google.com/maps?q=".concat(latitude, ",").concat(longitude);
        };
        PontoService_1.prototype.registrarPonto = function (funcionarioId, tipo, latitude, longitude, accuracy) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, lat, lng, accuracyNormalizada, tiposValidos, tipoNormalizado, resultadoLocal, funcionario, agora, resultado, horarioFormatado, tempoTrabalhado, ultimaEntrada, diferencaMs, linkMapa, erroWhatsapp_1, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 8, , 9]);
                            _a = this.validarCoordenadas(latitude, longitude), lat = _a.lat, lng = _a.lng;
                            accuracyNormalizada = accuracy == null || Number.isNaN(Number(accuracy))
                                ? null
                                : Number(Number(accuracy).toFixed(2));
                            console.log('REGISTRAR PONTO:', {
                                funcionarioId: funcionarioId,
                                tipo: tipo,
                                latitudeOriginal: latitude,
                                longitudeOriginal: longitude,
                                latitudeNormalizada: lat,
                                longitudeNormalizada: lng,
                                accuracy: accuracyNormalizada,
                            });
                            if (accuracyNormalizada != null && accuracyNormalizada > 100) {
                                throw new common_1.BadRequestException("Localiza\u00E7\u00E3o imprecisa (".concat(Math.round(accuracyNormalizada), "m). Ative o GPS e tente novamente."));
                            }
                            tiposValidos = [
                                'ENTRADA',
                                'SAIDA_ALMOCO',
                                'VOLTA_ALMOCO',
                                'SAIDA',
                            ];
                            tipoNormalizado = tipo.toUpperCase();
                            if (!tiposValidos.includes(tipoNormalizado)) {
                                throw new common_1.BadRequestException('Tipo de ponto inválido');
                            }
                            resultadoLocal = this.encontrarLocalMaisProximo(lat, lng);
                            if (!resultadoLocal.local) {
                                throw new common_1.BadRequestException('Nenhum local permitido foi encontrado');
                            }
                            console.log('LOCAL MAIS PRÓXIMO:', resultadoLocal.local.nome);
                            console.log('DISTÂNCIA ATÉ O LOCAL:', Math.round(resultadoLocal.distancia), 'm');
                            if (resultadoLocal.distancia > resultadoLocal.local.raio) {
                                throw new common_1.BadRequestException("Voc\u00EA est\u00E1 fora da \u00E1rea permitida para registrar ponto. Local mais pr\u00F3ximo: ".concat(resultadoLocal.local.nome, " (").concat(Math.round(resultadoLocal.distancia), "m)"));
                            }
                            return [4 /*yield*/, this.prisma.funcionarios.findUnique({
                                    where: {
                                        id: BigInt(funcionarioId),
                                    },
                                    include: {
                                        usuarios: true,
                                    },
                                })];
                        case 1:
                            funcionario = _b.sent();
                            if (!funcionario) {
                                throw new common_1.BadRequestException('Funcionário não encontrado');
                            }
                            agora = new Date();
                            return [4 /*yield*/, this.prisma.registros_ponto.create({
                                    data: {
                                        funcionario_id: BigInt(funcionarioId),
                                        tipo: tipoNormalizado,
                                        data_hora: agora,
                                        latitude: lat,
                                        longitude: lng,
                                        observacao: "Local do ponto: ".concat(resultadoLocal.local.nome),
                                    },
                                })];
                        case 2:
                            resultado = _b.sent();
                            console.log('PONTO SALVO:', resultado);
                            horarioFormatado = new Date(resultado.data_hora).toLocaleString('pt-BR', {
                                timeZone: 'America/Sao_Paulo',
                            });
                            tempoTrabalhado = 'Ainda não calculado';
                            if (!(tipoNormalizado === 'SAIDA')) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.prisma.registros_ponto.findFirst({
                                    where: {
                                        funcionario_id: BigInt(funcionarioId),
                                        tipo: 'ENTRADA',
                                        data_hora: {
                                            lt: resultado.data_hora,
                                        },
                                    },
                                    orderBy: {
                                        data_hora: 'desc',
                                    },
                                })];
                        case 3:
                            ultimaEntrada = _b.sent();
                            if (ultimaEntrada) {
                                diferencaMs = new Date(resultado.data_hora).getTime() -
                                    new Date(ultimaEntrada.data_hora).getTime();
                                tempoTrabalhado = this.formatarDuracao(diferencaMs);
                            }
                            else {
                                tempoTrabalhado = 'Sem entrada anterior';
                            }
                            _b.label = 4;
                        case 4:
                            _b.trys.push([4, 6, , 7]);
                            linkMapa = this.montarLinkMapa(lat, lng);
                            return [4 /*yield*/, this.whatsappService.enviarMensagemRegistroPonto({
                                    nome: funcionario.usuarios.nome,
                                    tipo: tipoNormalizado,
                                    horario: horarioFormatado,
                                    tempo: tempoTrabalhado,
                                    local: "".concat(resultadoLocal.local.nome, " | ").concat(linkMapa),
                                })];
                        case 5:
                            _b.sent();
                            console.log('WHATSAPP ENVIADO COM SUCESSO');
                            return [3 /*break*/, 7];
                        case 6:
                            erroWhatsapp_1 = _b.sent();
                            console.error('ERRO AO ENVIAR WHATSAPP:', erroWhatsapp_1);
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/, __assign(__assign({}, resultado), { id: resultado.id.toString(), funcionario_id: resultado.funcionario_id.toString() })];
                        case 8:
                            error_1 = _b.sent();
                            console.error('ERRO AO REGISTRAR PONTO:', error_1);
                            throw error_1;
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        PontoService_1.prototype.listarPontos = function (funcionarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var pontos, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            console.log('LISTAR PONTOS:', { funcionarioId: funcionarioId });
                            return [4 /*yield*/, this.prisma.registros_ponto.findMany({
                                    where: {
                                        funcionario_id: BigInt(funcionarioId),
                                    },
                                    orderBy: {
                                        data_hora: 'desc',
                                    },
                                })];
                        case 1:
                            pontos = _a.sent();
                            return [2 /*return*/, pontos.map(function (ponto) { return (__assign(__assign({}, ponto), { id: ponto.id.toString(), funcionario_id: ponto.funcionario_id.toString() })); })];
                        case 2:
                            error_2 = _a.sent();
                            console.error('ERRO AO LISTAR PONTOS:', error_2);
                            throw error_2;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return PontoService_1;
    }());
    __setFunctionName(_classThis, "PontoService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PontoService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PontoService = _classThis;
}();
exports.PontoService = PontoService;
