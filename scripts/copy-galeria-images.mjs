#!/usr/bin/env node
/**
 * Copia fotos desde las carpetas del workspace a public/images/galeria/
 * y genera src/data/galeriaImages.generated.ts con la lista de archivos.
 *
 * Carpetas esperadas en la raíz del proyecto:
 * - Asamblea Plenaria de REGULATEL 12122025
 * - Cumbre REGULATEL ASIET COMTELCA 11122025
 *
 * Uso: node scripts/copy-galeria-images.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_GALERIA = path.join(ROOT, "public", "images", "galeria");

const ASAMBLEA_SLUG = "asamblea-plenaria-12122025";
const CUMBRE_SLUG = "cumbre-regulatel-asiet-comtelca-11122025";

const SOURCE_FOLDERS = [
  {
    exactName: "Asamblea Plenaria de REGULATEL 12122025",
    slug: ASAMBLEA_SLUG,
    match: (dirName) => /asamblea/i.test(dirName) && /12122025/.test(dirName),
  },
  {
    exactName: "Cumbre REGULATEL ASIET COMTELCA 11122025",
    slug: CUMBRE_SLUG,
    match: (dirName) => /cumbre/i.test(dirName) && /11122025/.test(dirName),
  },
];

const argv = process.argv.slice(2);
const cliPathAsamblea = argv[0];
const cliPathCumbre = argv[1];

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getExtension(filename) {
  const m = filename.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "jpg";
}

function findFolderPath(config, cliPath) {
  if (cliPath) {
    const p = path.resolve(cliPath);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
  }
  const exactPath = path.join(ROOT, config.exactName);
  if (fs.existsSync(exactPath) && fs.statSync(exactPath).isDirectory()) {
    return exactPath;
  }
  const cwd = process.cwd();
  if (cwd !== ROOT) {
    const exactCwd = path.join(cwd, config.exactName);
    if (fs.existsSync(exactCwd) && fs.statSync(exactCwd).isDirectory()) return exactCwd;
    try {
      const cwdDirs = fs.readdirSync(cwd, { withFileTypes: true }).filter((d) => d.isDirectory());
      const found = cwdDirs.find((d) => config.match(d.name));
      if (found) return path.join(cwd, found.name);
    } catch (_) {}
  }
  const rootDirs = fs.readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory());
  let found = rootDirs.find((d) => config.match(d.name));
  if (found) return path.join(ROOT, found.name);
  const parent = path.dirname(ROOT);
  if (fs.existsSync(parent)) {
    try {
      const parentDirs = fs.readdirSync(parent, { withFileTypes: true }).filter((d) => d.isDirectory());
      found = parentDirs.find((d) => config.match(d.name));
      if (found) return path.join(parent, found.name);
    } catch (_) {}
  }
  const downloads = path.join(ROOT, "..", "..", "..", "Downloads");
  if (fs.existsSync(downloads)) {
    try {
      const dlDirs = fs.readdirSync(downloads, { withFileTypes: true }).filter((d) => d.isDirectory());
      found = dlDirs.find((d) => config.match(d.name));
      if (found) return path.join(downloads, found.name);
    } catch (_) {}
  }
  return null;
}

function processFolder(config, cliPath) {
  const srcPath = findFolderPath(config, cliPath);
  const destDir = path.join(PUBLIC_GALERIA, config.slug);
  const copied = [];

  if (!srcPath) {
    console.warn(`Carpeta no encontrada (buscar: ${config.exactName} o nombre que contenga la fecha): ${config.slug}`);
    return { slug: config.slug, images: [] };
  }

  ensureDir(destDir);
  const files = fs.readdirSync(srcPath).filter((f) => IMAGE_EXT.test(f));
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const srcDir = srcPath;
  files.forEach((file, i) => {
    const ext = getExtension(file);
    const destName = `${String(i + 1).padStart(2, "0")}.${ext}`;
    const destPath = path.join(destDir, destName);
    fs.copyFileSync(path.join(srcDir, file), destPath);
    copied.push(destName);
  });

  console.log(`${config.slug}: ${copied.length} fotos copiadas.`);
  return { slug: config.slug, images: copied };
}

const generated = {};
const cliPaths = [cliPathAsamblea, cliPathCumbre];
SOURCE_FOLDERS.forEach((config, i) => {
  const { slug, images } = processFolder(config, cliPaths[i]);
  generated[slug] = images;
});

const outPath = path.join(ROOT, "src", "data", "galeriaImages.generated.ts");
const content = `/** Generado por scripts/copy-galeria-images.mjs - no editar a mano. Ejecuta el script para rellenar desde las carpetas de fotos. */\nexport const galeriaImages: Record<string, string[]> = ${JSON.stringify(generated, null, 2)};\n`;
fs.writeFileSync(outPath, content, "utf8");
console.log(`Escrito: ${outPath}`);
console.log("Listo. Los álbumes en la galería usarán estas imágenes.");
console.log("Si no había carpetas de fotos, añade las imágenes en public/images/galeria/<slug>/ y vuelve a ejecutar el script o edita src/data/galeria.ts.");