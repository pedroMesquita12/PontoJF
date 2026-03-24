"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PontoModule = void 0;
const common_1 = require("@nestjs/common");
const ponto_controller_1 = require("./ponto.controller");
const ponto_service_1 = require("./ponto.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PontoModule = class PontoModule {
};
exports.PontoModule = PontoModule;
exports.PontoModule = PontoModule = __decorate([
    (0, common_1.Module)({
        controllers: [ponto_controller_1.PontoController],
        providers: [ponto_service_1.PontoService, prisma_service_1.PrismaService],
    })
], PontoModule);
//# sourceMappingURL=ponto.module.js.map