import { generateEndpoints } from '@rtk-query/codegen-openapi';

async function main() {
  const url = process.env.API_URL || 'http://localhost:4000';
  const schemaUrl = `${url}/api/docs-json`;

  console.log(`Generating RTK Query hooks from ${schemaUrl}...`);

  await generateEndpoints({
    apiFile: './src/platform/api/rtk-query/base-api.ts',
    outputFile: './src/platform/api/rtk-query/generated/api.ts',
    schemaFile: schemaUrl,
    tag: true,
    hooks: true,
    flattenArg: true,
    responseSuffix: 'Response',
    argSuffix: 'Arg',
  });

  console.log('Codegen complete — generated/api.ts updated');
}

main().catch((err: unknown) => {
  console.error('Codegen failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
