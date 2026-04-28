import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }

  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
  return {
    sub: payload.sub,
    id: payload.sub,
    funcionarioId: payload.funcionarioId ?? payload.sub,
    funcionario_id: payload.funcionarioId ?? payload.sub,
    usuarioId: payload.usuarioId,
    usuario_id: payload.usuarioId,
    nome: payload.nome,
    email: payload.email,
    matricula: payload.matricula,
    perfil: payload.perfil,
    empresa_id: payload.empresa_id,
  };
}
}
