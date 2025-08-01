const fs = require('fs');
const path = require('path');

const apiUrl = process.argv[2];
if (!apiUrl) {
  console.error('請輸入 API URL，例如: npm run set-api-url https://your-backend/api');
  process.exit(1);
}

const envPath = path.join(__dirname, '../src/environment/environment.ts');

const content = `export const environment = {
  apiUrl: '${apiUrl}',
}
`;

fs.writeFileSync(envPath, content, 'utf8');
console.log(`已將 apiUrl 設定為: ${apiUrl}`);
