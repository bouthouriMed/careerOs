import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OAuthService } from './oauth.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionRepository } from './session.repository';

@Module({
  controllers: [AuthController],
  providers: [
    OAuthService,
    SessionService,
    TokenService,
    PrismaService,
    SessionRepository,
  ],
  exports: [SessionService],
})
export class AuthModule {}
