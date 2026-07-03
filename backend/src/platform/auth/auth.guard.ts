import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from './session.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies?.session;

    if (!sessionId) {
      throw new UnauthorizedException('No session cookie');
    }

    const session = await this.sessionService.validateSession(sessionId);

    request.user = {
      id: session.userId,
      sessionId: session.id,
    };

    return true;
  }
}
