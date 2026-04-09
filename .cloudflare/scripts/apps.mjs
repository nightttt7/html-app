import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(scriptDirectory, '../..');

const defaultsFile = path.join(repoRoot, '.cloudflare', 'deploy.defaults.json');
const reservedDirectories = new Set(['.cloudflare', '.git', '.github', 'node_modules']);
const workerNamePattern = /^[a-z0-9-]+$/;

export async function loadDeployDefaults(rootDirectory = repoRoot) {
  const filePath = path.join(rootDirectory, '.cloudflare', 'deploy.defaults.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function listDeployableApps(rootDirectory = repoRoot) {
  const defaults = await loadDeployDefaults(rootDirectory);
  const entries = await fs.readdir(rootDirectory, { withFileTypes: true });
  const apps = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name.startsWith('.') || reservedDirectories.has(entry.name)) {
      continue;
    }

    const app = await readAppDefinition({
      rootDirectory,
      folderName: entry.name,
      defaults,
    });

    if (app) {
      apps.push(app);
    }
  }

  return apps;
}

export async function getDeployableApp(appName, rootDirectory = repoRoot) {
  const apps = await listDeployableApps(rootDirectory);
  const app = apps.find((candidate) => candidate.name === appName);

  if (!app) {
    throw new Error(`No deployable app named "${appName}" was found.`);
  }

  return app;
}

export function normalizeRelativePath(filePath) {
  return filePath.replaceAll('\\', '/').replace(/^\.\//, '').replace(/^\/+/, '');
}

export function isSharedDeploymentFile(filePath) {
  const normalizedPath = normalizeRelativePath(filePath);

  return (
    normalizedPath === '.github/workflows/deploy-html-apps.yml' ||
    normalizedPath.startsWith('.cloudflare/')
  );
}

export function buildMatrix(apps) {
  return {
    include: apps.map((app) => ({
      name: app.name,
      folder: app.folder,
      entryHtml: app.entryHtml,
      url: app.url,
    })),
  };
}

async function readAppDefinition({ rootDirectory, folderName, defaults }) {
  if (!workerNamePattern.test(folderName)) {
    throw new Error(
      `Folder "${folderName}" is not a valid Cloudflare Worker name. Use lowercase letters, numbers, and hyphens only.`,
    );
  }

  const directoryPath = path.join(rootDirectory, folderName);
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (htmlFiles.length === 0) {
    return null;
  }

  const indexFile = htmlFiles.find((fileName) => fileName.toLowerCase() === 'index.html');

  if (!indexFile && htmlFiles.length > 1) {
    throw new Error(
      `Folder "${folderName}" contains multiple HTML files but no index.html. Add index.html or keep exactly one HTML entry file.`,
    );
  }

  const entryHtml = indexFile ?? htmlFiles[0];

  return {
    name: folderName,
    folder: folderName,
    directoryPath,
    entryHtml,
    needsIndexAlias: entryHtml.toLowerCase() !== 'index.html',
    url: `https://${folderName}.${defaults.workersDevSubdomain}`,
  };
}

export { defaultsFile };