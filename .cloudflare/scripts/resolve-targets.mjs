import { buildMatrix, getDeployableApp, isSharedDeploymentFile, listDeployableApps } from './apps.mjs';

const options = parseArguments(process.argv.slice(2));

try {
  const apps = await resolveApps(options);
  process.stdout.write(`${JSON.stringify(buildMatrix(apps))}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}

async function resolveApps({ mode, app }) {
  if (mode === 'manual') {
    if (app) {
      return [await getDeployableApp(app)];
    }

    return listDeployableApps();
  }

  const allApps = await listDeployableApps();
  const changedFiles = await readChangedFilesFromStdin();

  if (changedFiles.length === 0 || changedFiles.some(isSharedDeploymentFile)) {
    return allApps;
  }

  const changedFolders = new Set(
    changedFiles
      .map((filePath) => filePath.split('/')[0])
      .filter(Boolean),
  );

  return allApps.filter((candidate) => changedFolders.has(candidate.folder));
}

async function readChangedFilesFromStdin() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return chunks
    .join('')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replaceAll('\\', '/'));
}

function parseArguments(argumentsList) {
  const options = {
    mode: 'changed',
    app: '',
  };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];

    if (argument === '--mode') {
      options.mode = argumentsList[index + 1] ?? options.mode;
      index += 1;
      continue;
    }

    if (argument === '--app') {
      options.app = argumentsList[index + 1] ?? options.app;
      index += 1;
    }
  }

  if (!['changed', 'manual'].includes(options.mode)) {
    throw new Error(`Unsupported mode "${options.mode}".`);
  }

  return options;
}