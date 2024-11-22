import fs from 'node:fs';
import fsAsync from 'node:fs/promises';
import path from 'path';

export interface Config {
  minTimeslot: number;
  maxTimeslot: number;
  maxDay: number;
  minDay: number;
  maxReserveLength: number;
  serverPort: number;
  pollingRate: number;
  semesterEnd: string;
  ignoreTimeslotBoundary: boolean;
  ignoreDayBoundary: boolean;
  ignoreLengthBoundary: boolean;
}

let config: Config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'));

export function getConfig(): Config {
  return config;
}

export async function updateConfig(configUpdates: Partial<Config>) {
  const newConfig: Config = {
    ...config,
    ...configUpdates
  }
  console.log("New config received:\n" + JSON.stringify(newConfig));

  console.log("OK. Now currently trying to update..");
  try {
    await fsAsync.writeFile(path.join(process.cwd(), 'config.json'), JSON.stringify(newConfig, undefined, 2));
    read();
    console.log("Config updated and re-read.");
    console.log(`Current config:\n ${JSON.stringify(config, null, 2)}`)
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
