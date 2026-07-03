/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
  schemaFile: './openapi.json',
  apiFile: './src/platform/api/rtk-query/base-api.ts',
  apiImport: 'baseApi',
  outputFile: './src/platform/api/rtk-query/generated/api.ts',
  exportName: 'api',
  hooks: true,
  tag: true,
};

module.exports = config;
