import fs from 'node:fs';
import fsAsync from 'node:fs/promises';
import path from 'path';

export interface Config {
  maxTimeslot: number;
  maxDay: number;
  maxScheduleLength: number;
  maxReserveLength: number;
  serverPort: number;
  pollingRate: number;
}

let config: Config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'));

export function getConfig(): Config {
  return config;
}

export async function updateConfig(newConfig: Config) {
  console.log("New config received:\n" + JSON.stringify(newConfig));
  const keysOld = Object.keys(config);
  const keysNew = Object.keys(config);

  if (keysOld.length !== keysNew.length) {
    return;
  }

  for (let i = 0; i < keysOld.length; i++) {
    if (keysOld[i] !== keysNew[i]) {
      return;
    }
  }

  console.log("OK. Now currently trying to update..");
  try {
    await fsAsync.writeFile(path.join(process.cwd(), 'config.json'), JSON.stringify(newConfig, undefined, 2));
    read();
    console.log("Config updated and re-read.");
  } catch (e) {
    console.log("Failed to overwrite config. Error: \n" + e)
  }
}

export async function read() {
  try {
    config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'));
  } catch (e) {
    console.log("Failed to read from file. Is the config structure correct?\n" + e);
  }
}

export default config;
