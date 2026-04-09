import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { getDeployableApp, loadDeployDefaults, repoRoot } from './apps.mjs';

const argumentsList = process.argv.slice(2);
const dryRun = argumentsList.includes('--dry-run');
const appName = argumentsList.find((argument) => !argument.startsWith('--'));

if (!appName) {
  console.error('Usage: node .cloudflare/scripts/deploy-app.mjs <app-name> [--dry-run]');
  process.exit(1);
}

if (!dryRun && !process.env.CLOUDFLARE_API_TOKEN) {
  console.error('CLOUDFLARE_API_TOKEN is required.');
  process.exit(1);
}

const app = await getDeployableApp(appName);
const defaults = await loadDeployDefaults();
const workspaceDirectory = await fs.mkdtemp(path.join(os.tmpdir(), `html-app-${app.name}-`));

try {
  const assetsDirectory = path.join(workspaceDirectory, 'assets');
  await fs.cp(app.directoryPath, assetsDirectory, { recursive: true });

  if (app.needsIndexAlias) {
    await fs.copyFile(
      path.join(assetsDirectory, app.entryHtml),
      path.join(assetsDirectory, 'index.html'),
    );
  }

  const config = {
    name: app.name,
    compatibility_date: defaults.compatibilityDate,
    workers_dev: defaults.workersDev,
    assets: {
      directory: './assets',
      not_found_handling: defaults.notFoundHandling,
    },
  };

  if (process.env.CLOUDFLARE_ACCOUNT_ID) {
    config.account_id = process.env.CLOUDFLARE_ACCOUNT_ID;
  }

  const configPath = path.join(workspaceDirectory, 'wrangler.jsonc');
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  console.log(`Deploying ${app.name} from ${app.folder}/${app.entryHtml}`);

  if (dryRun) {
    console.log(`Dry run complete. Temporary config prepared for ${app.name}.`);
    console.log(`Expected workers.dev URL: ${app.url}`);
  } else {
    await runCommand('npx', ['--yes', 'wrangler@4', 'deploy', '--config', configPath], {
      cwd: repoRoot,
      env: process.env,
    });

    console.log(`Expected workers.dev URL: ${app.url}`);
  }
} finally {
  await fs.rm(workspaceDirectory, { recursive: true, force: true });
}

function runCommand(command, argumentsList, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, argumentsList, {
      ...options,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? 'unknown'}.`));
    });
  });
}