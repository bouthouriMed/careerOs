import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import { authConfig } from '../config/auth.config';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

@Injectable()
export class OAuthService {
  private readonly config = authConfig();

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.google.clientId,
      redirect_uri: this.config.google.callbackUrl,
      response_type: 'code',
      scope: this.config.google.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<{ id: string; email: string; name: string | null; avatar: string | null }> {
    const tokens = await this.exchangeCodeForTokens(code);
    const profile = await this.getGoogleProfile(tokens.access_token);

    const user = await this.findOrCreateUser(profile, tokens);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
  }

  private async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.google.clientId,
        client_secret: this.config.google.clientSecret,
        redirect_uri: this.config.google.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to exchange authorization code');
    }

    return response.json();
  }

  private async getGoogleProfile(accessToken: string): Promise<GoogleProfile> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch Google profile');
    }

    return response.json();
  }

  private async findOrCreateUser(profile: GoogleProfile, tokens: GoogleTokenResponse) {
    const encryptedAccessToken = this.tokenService.encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? this.tokenService.encrypt(tokens.refresh_token)
      : null;
    const expiryDate = new Date(Date.now() + tokens.expires_in * 1000);

    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.id },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
          googleAccessToken: encryptedAccessToken,
          googleRefreshToken: encryptedRefreshToken,
          googleTokenExpiry: expiryDate,
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
          googleAccessToken: encryptedAccessToken,
          googleRefreshToken: encryptedRefreshToken,
          googleTokenExpiry: expiryDate,
        },
      });
    }

    return user;
  }
}
