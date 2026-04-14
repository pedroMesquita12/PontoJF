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
  console.log('JWT PAYLOAD VALIDADO:', payload);

  return {
    sub: payload.sub,
    id: payload.sub,
    usuarioId: payload.usuarioId,
    nome: payload.nome,
    email: payload.email,
    matricula: payload.matricula,
    perfil: payload.perfil,
  };
}
}