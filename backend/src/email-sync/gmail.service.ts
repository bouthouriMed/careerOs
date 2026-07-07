import { Injectable } from '@nestjs/common';
import { google, gmail_v1 } from 'googleapis';
import { PrismaService } from '../platform/prisma/prisma.service';
import { TokenService } from '../platform/auth/token.service';

export interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  body: string;
  date: Date;
}

const BATCH_SIZE = 10;

@Injectable()
export class GmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async fetchMessagesSince(
    userId: string,
    sinceDate: Date,
    onProgress?: (processed: number, total: number) => void,
  ): Promise<GmailMessage[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.googleAccessToken) {
      throw new Error('No Google tokens found for user');
    }

    const accessToken = this.tokenService.decrypt(user.googleAccessToken);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const query = `after:${Math.floor(sinceDate.getTime() / 1000)}`;
    const messages: gmail_v1.Schema$Message[] = [];
    let pageToken: string | undefined;

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 100,
        pageToken,
      });

      if (response.data.messages) {
        messages.push(...response.data.messages);
      }
      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);

    const fullMessages: GmailMessage[] = [];
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (msg) => {
          if (!msg.id) return null;
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full',
          });
          return this.parseMessage(detail.data);
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          fullMessages.push(result.value);
        }
      }

      onProgress?.(Math.min(i + BATCH_SIZE, messages.length), messages.length);
    }

    return fullMessages;
  }

  private parseMessage(message: gmail_v1.Schema$Message): GmailMessage | null {
    const headers = message.payload?.headers ?? [];
    const subject = headers.find((h) => h.name === 'Subject')?.value ?? '';
    const from = headers.find((h) => h.name === 'From')?.value ?? '';
    const dateStr = headers.find((h) => h.name === 'Date')?.value ?? '';

    const body = this.extractBody(message.payload);
    const date = dateStr ? new Date(dateStr) : new Date();

    if (!message.id) return null;

    return { id: message.id, subject, from, body, date };
  }

  private extractBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
    if (!payload) return '';

    if (payload.mimeType === 'text/plain' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64url').toString('utf8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        const body = this.extractBody(part);
        if (body) return body;
      }
    }

    return '';
  }
}
