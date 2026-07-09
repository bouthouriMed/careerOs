export function validateEnvironment(config: Record<string, unknown>) {
  const required = [
    'DATABASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'SESSION_SECRET',
    'ENCRYPTION_KEY',
  ];

  const optional = ['AI_PROVIDER', 'OPENAI_API_KEY'];

  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  return config;
}
