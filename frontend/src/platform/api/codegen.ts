import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const SWAGGER_URL = 'http://localhost:4000/api/docs-json';
const OUTPUT_PATH = resolve(__dirname, '../../../../openapi.json');

async function main() {
  console.log(`Fetching OpenAPI spec from ${SWAGGER_URL}...`);
  const res = await fetch(SWAGGER_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${res.status} ${res.statusText}`);
  }
  const spec = await res.json();
  writeFileSync(OUTPUT_PATH, JSON.stringify(spec, null, 2));
  console.log(`Saved to ${OUTPUT_PATH}`);

  console.log('Running RTK Query codegen...');
  execSync('npx @rtk-query/codegen-openapi codegen.config.js', {
    stdio: 'inherit',
    cwd: resolve(__dirname, '../../../..'),
  });
  console.log('Codegen complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
