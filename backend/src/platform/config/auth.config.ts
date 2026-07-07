export const authConfig = () => ({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL!,
    scopes: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
  },
  session: {
    secret: process.env.SESSION_SECRET!,
    expiryHours: parseInt(process.env.SESSION_EXPIRY_HOURS || '72', 10),
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY!,
  },
});
