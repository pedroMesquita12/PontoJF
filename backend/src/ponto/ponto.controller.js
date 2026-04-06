"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PontoController = void 0;
var common_1 = require("@nestjs/common");
var PontoController = function () {
    var _classDecorators = [(0, common_1.Controller)('ponto')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _registrar_decorators;
    var _listar_decorators;
    var PontoController = _classThis = /** @class */ (function () {
        function PontoController_1(pontoService) {
            this.pontoService = (__runInitializers(this, _instanceExtraInitializers), pontoService);
        }
        PontoController_1.prototype.registrar = function (body) {
            console.log('=== POST /ponto/registrar ===');
            console.log('BODY PONTO:', body);
            var funcionarioId = Number(body.funcionarioId);
            var latitude = body.latitude != null ? Number(body.latitude) : undefined;
            var longitude = body.longitude != null ? Number(body.longitude) : undefined;
            var accuracy = body.accuracy != null ? Number(body.accuracy) : undefined;
            if (!body.tipo || Number.isNaN(funcionarioId)) {
                throw new common_1.BadRequestException('funcionarioId ou tipo inválido');
            }
            return this.pontoService.registrarPonto(funcionarioId, body.tipo, latitude, longitude, accuracy);
        };
        PontoController_1.prototype.listar = function (funcionarioId) {
            console.log('=== GET /ponto/:funcionarioId ===');
            console.log('PARAM PONTO:', funcionarioId);
            var id = Number(funcionarioId);
            if (Number.isNaN(id)) {
                throw new common_1.BadRequestException('funcionarioId inválido');
            }
            return this.pontoService.listarPontos(id);
        };
        return PontoController_1;
    }());
    __setFunctionName(_classThis, "PontoController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _registrar_decorators = [(0, common_1.Post)('registrar')];
        _listar_decorators = [(0, common_1.Get)(':funcionarioId')];
        __esDecorate(_classThis, null, _registrar_decorators, { kind: "method", name: "registrar", static: false, private: false, access: { has: function (obj) { return "registrar" in obj; }, get: function (obj) { return obj.registrar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listar_decorators, { kind: "method", name: "listar", static: false, private: false, access: { has: function (obj) { return "listar" in obj; }, get: function (obj) { return obj.listar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PontoController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PontoController = _classThis;
}();
exports.PontoController = PontoController;
