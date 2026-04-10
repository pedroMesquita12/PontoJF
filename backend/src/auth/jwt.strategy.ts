import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'senha_super_secreta',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      matricula: payload.matricula,
      email: payload.email ?? null,
      nome: payload.nome ?? null,
    };
  }
}