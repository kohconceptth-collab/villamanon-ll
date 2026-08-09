import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(process.argv[2] ?? resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const sourcePath = process.argv[3] ? resolve(process.argv[3]) : null;
const htmlPath = resolve(projectRoot, "index.html");
const html = await readFile(htmlPath, "utf8");
const agenceHtml = await readFile(resolve(projectRoot, "agence.html"), "utf8");
const linkedStyles = [...html.matchAll(/<link\b[^>]*href=["']css\/([^"']+\.css)["'][^>]*\/?>/gi)].map(
  (match) => match[1],
);
const cssParts = await Promise.all(
  linkedStyles.map((filename) => readFile(resolve(projectRoot, "css", filename), "utf8")),
);
const css = cssParts.join("\n");
const scriptFilenames = [
  "script.js",
  "fullscreen.js",
  "gallery-map-zoom.js",
  "simulator-layout.js",
  "premium-interactions.js",
  "rawai-video.js",
];
const javascriptParts = await Promise.all(
  scriptFilenames.map((filename) => readFile(resolve(projectRoot, "js", filename), "utf8")),
);
const javascript = javascriptParts.join("\n");

const failures = [];
const checkedFiles = new Set();
const localReferencePattern = /(?:src|href|poster|data-blueprint)\s*=\s*["']([^"'#][^"']*)["']/gi;
const cssUrlPattern = /url\(\s*["']?([^"'()]+)["']?\s*\)/gi;
const ignoredSchemes = /^(?:https?:|mailto:|tel:|javascript:|data:|\/\/)/i;

async function verifyReference(reference, baseDirectory) {
  if (ignoredSchemes.test(reference)) return;
  const cleanReference = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  if (!cleanReference) return;
  const absolutePath = resolve(baseDirectory, cleanReference);
  if (checkedFiles.has(absolutePath)) return;
  checkedFiles.add(absolutePath);
  try {
    await access(absolutePath);
  } catch {
    failures.push(`Ressource introuvable: ${reference}`);
  }
}

for (const match of html.matchAll(localReferencePattern)) {
  await verifyReference(match[1], projectRoot);
}
for (const match of agenceHtml.matchAll(localReferencePattern)) {
  await verifyReference(match[1], projectRoot);
}
for (const match of css.matchAll(cssUrlPattern)) {
  await verifyReference(match[1], resolve(projectRoot, "css"));
}

const ids = new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]));
for (const match of html.matchAll(/\bhref\s*=\s*["']#([^"']+)["']/gi)) {
  if (match[1] && !ids.has(match[1])) failures.push(`Ancre sans cible: #${match[1]}`);
}

if (/<style\b/i.test(html)) failures.push("CSS interne encore présent dans index.html");
if (/<script\b(?![^>]*\b(?:src\s*=|type\s*=\s*["']application\/ld\+json["']))/i.test(html)) {
  failures.push("JavaScript interne encore présent dans index.html");
}
if (linkedStyles.length !== 32 || linkedStyles[0] !== "style.css") {
  failures.push(`Ordre des feuilles CSS invalide: ${linkedStyles.length} fichier(s)`);
}
const linkedScripts = [...html.matchAll(/<script\b[^>]*src=["']js\/([^"']+)["'][^>]*><\/script>/gi)].map(
  (match) => match[1],
);
if (linkedScripts.join(",") !== scriptFilenames.join(",")) {
  failures.push(`Ordre des scripts invalide: ${linkedScripts.join(",") || "aucun"}`);
}

const agenceStyles = [...agenceHtml.matchAll(/<link\b[^>]*href=["']css\/([^"']+\.css)["'][^>]*\/?>/gi)].map(
  (match) => match[1],
);
const agenceScripts = [...agenceHtml.matchAll(/<script\b[^>]*src=["']js\/([^"']+)["'][^>]*><\/script>/gi)].map(
  (match) => match[1],
);
if (agenceStyles.join(",") !== linkedStyles.join(",")) {
  failures.push("agence.html ne partage pas exactement les feuilles CSS de index.html");
}
if (agenceScripts.join(",") !== linkedScripts.join(",")) {
  failures.push("agence.html ne partage pas exactement les scripts de index.html");
}
if (/\bid=["']contact["']/i.test(agenceHtml)) {
  failures.push("La section de contact est encore prÃ©sente dans agence.html");
}
if (/\bdata-i18n=["']waViewing["']/i.test(agenceHtml)) {
  failures.push("Le bouton de visite est encore prÃ©sent dans agence.html");
}

const projectMetrics = {
  tags: (html.match(/<[a-z][^>]*>/gi) ?? []).length,
  ids: ids.size,
  internalAnchors: (html.match(/\bhref\s*=\s*["']#/gi) ?? []).length,
  forms: (html.match(/<form\b/gi) ?? []).length,
  images: (html.match(/<img\b/gi) ?? []).length,
  scripts: (javascript.match(/\b(?:addEventListener|onclick|onchange)\b/g) ?? []).length,
};

let sourceMetrics = null;
if (sourcePath) {
  const source = await readFile(sourcePath, "utf8");
  const sourceStyles = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(
    (match) => match[1].trim(),
  );
  const sourceScripts = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => match[1].trim(),
  );
  const sourceMarkup = source
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  sourceMetrics = {
    tags: (sourceMarkup.match(/<[a-z][^>]*>/gi) ?? []).length,
    ids:
      new Set([...source.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1])).size +
      (/\bid=["']rawaiVideo["']/i.test(html) && !/\bid=["']rawaiVideo["']/i.test(source) ? 1 : 0),
    internalAnchors: (sourceMarkup.match(/\bhref\s*=\s*["']#/gi) ?? []).length,
    forms: (sourceMarkup.match(/<form\b/gi) ?? []).length,
    images: (sourceMarkup.match(/<img\b/gi) ?? []).length,
  };

  for (const key of ["ids", "internalAnchors", "forms", "images"]) {
    if (sourceMetrics[key] !== projectMetrics[key]) {
      failures.push(`Écart structurel ${key}: source=${sourceMetrics[key]}, projet=${projectMetrics[key]}`);
    }
  }

  const normalizeMarkup = (markup) =>
    markup
      .replace(/<video\b[^>]*id=["']rawaiVideo["'][^>]*>[\s\S]*?<\/video>/gi, "")
      .replace(/<link\b[^>]*href=["']css\/style\.css["'][^>]*\/?>/gi, "")
      .replace(/<link\b[^>]*href=["']css\/[^"']+\.css["'][^>]*\/?>/gi, "")
      .replace(/<script\b[^>]*src=["']js\/[^"']+["'][^>]*><\/script>/gi, "")
      .replace(
        /\b(src|poster|data-blueprint|data-design)=(["'])(?:data:[\s\S]*?|assets\/images\/[^"']+)\2/gi,
        '$1=$2__EXTERNALIZED_ASSET__$2',
      )
      .replace(/\r\n/g, "\n")
      .trim();

  if (normalizeMarkup(sourceMarkup) !== normalizeMarkup(html)) {
    failures.push("Le balisage HTML diffère de la référence hors ressources externalisées");
  }

  const normalizeCss = (stylesheet) =>
    stylesheet
      .replace(/data:[^'")\s]+/gi, "__EXTERNALIZED_ASSET__")
      .replace(/\.\.\/assets\/images\/[^'")\s]+/gi, "__EXTERNALIZED_ASSET__")
      .replace(/\r\n/g, "\n")
      .trim();
  sourceStyles.forEach((sourceStyle, index) => {
    if (normalizeCss(cssParts[index] ?? "") !== normalizeCss(sourceStyle)) {
      failures.push(`Le bloc CSS ${index} diffère de la référence hors chemins externalisés`);
    }
  });

  const normalizeScript = (script, index) => {
    const normalized = script.trim();
    if (index !== 5) return normalized;
    return normalized
      .replace(/video\.muted = (?:true|false);/, "video.muted = __VIDEO_SOUND_SETTING__;")
      .replace(/video\.defaultMuted = (?:true|false);/, "video.defaultMuted = __VIDEO_SOUND_SETTING__;");
  };

  sourceScripts.forEach((sourceScript, index) => {
    if (index === 5 && /\benableSound\b/.test(javascriptParts[index])) return;
    if (normalizeScript(javascriptParts[index], index) !== normalizeScript(sourceScript, index)) {
      failures.push(`Le segment JavaScript ${index} diffère de la référence`);
    }
  });
}

console.log(JSON.stringify({ checkedFiles: checkedFiles.size, projectMetrics, sourceMetrics, failures }, null, 2));
if (failures.length) process.exitCode = 1;
