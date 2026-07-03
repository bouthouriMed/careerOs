import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { authConfig } from '../config/auth.config';

@Injectable()
export class SessionService {
  private readonly config = authConfig();

  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(userId: string) {
    const expiryMs = this.config.session.expiryHours * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expiryMs);

    return this.sessionRepository.create(userId, expiresAt);
  }

  async validateSession(sessionId: string) {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.delete(session.id);
      throw new UnauthorizedException('Session expired');
    }

    return session;
  }

  async revokeSession(sessionId: string) {
    await this.sessionRepository.delete(sessionId);
  }
}
