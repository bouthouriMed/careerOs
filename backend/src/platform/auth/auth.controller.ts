import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OAuthService } from './oauth.service';
import { SessionService } from './session.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import { EmailProviderConnectedEvent } from '../../email-sync/events/email-provider-connected.event';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly sessionService: SessionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get('google/url')
  @ApiOperation({ summary: 'Get Google OAuth authorization URL' })
  @ApiResponse({ status: 200, description: 'Returns the OAuth URL' })
  getGoogleAuthUrl(): { url: string } {
    return { url: this.oauthService.generateAuthUrl() };
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend' })
  async handleGoogleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const code = req.query.code as string;
    const user = await this.oauthService.handleCallback(code);
    const session = await this.sessionService.createSession(user.id);

    res.cookie('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 72 * 60 * 60 * 1000,
    });

    this.eventEmitter.emit(
      'email-provider.connected',
      new EmailProviderConnectedEvent(user.id),
    );

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/dashboard');
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionId = req.cookies?.session;
    if (sessionId) {
      await this.sessionService.revokeSession(sessionId);
    }
    res.clearCookie('session');
    res.json({ message: 'Logged out' });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns the current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCurrentUser(@CurrentUser() user: { id: string; email: string; name: string | null; avatar: string | null }) {
    return { user };
  }
}
