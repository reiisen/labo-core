import fs from 'node:fs';
import fsAsync from 'node:fs/promises';
import path from 'path';

let config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'));

export function getConfig(): object {
  return config;
}

export async function updateConfig(config: string) {
  await fsAsync.appendFile('../../config.json', config);
}

export default config;
