import { createHash } from "node:crypto";
import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";

const [sourceArg, outputArg = ".", videoArg] = process.argv.slice(2);
if (!sourceArg) {
  throw new Error("Usage: node tools/restructure.mjs <source.html> [output-directory]");
}

const sourcePath = resolve(sourceArg);
const outputRoot = resolve(outputArg);
const original = await readFile(sourcePath, "utf8");

const directories = [
  "css",
  "js",
  "assets/images",
  "assets/videos",
  "assets/icons",
];
await Promise.all(directories.map((directory) => mkdir(join(outputRoot, directory), { recursive: true })));

const videoFilename = "rawai-district-phuket.mp4";
const videoOutputPath = join(outputRoot, "assets", "videos", videoFilename);
if (videoArg) {
  await copyFile(resolve(videoArg), videoOutputPath);
}

const extensionByMime = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
]);

const resourceByDataUri = new Map();
const dataUriPattern = /data:([a-z0-9.+/-]+)(;base64)?,([a-z0-9+/=%._~!$&*+,;:@?-]+)/gi;
let resourceIndex = 0;
let html = original.replace(dataUriPattern, (dataUri, mime, base64Flag, payload) => {
  const normalizedMime = mime.toLowerCase();
  const extension = extensionByMime.get(normalizedMime);
  if (!extension) return dataUri;

  if (!resourceByDataUri.has(dataUri)) {
    resourceIndex += 1;
    const content = base64Flag
      ? Buffer.from(payload.replace(/\s/g, ""), "base64")
      : Buffer.from(decodeURIComponent(payload), "utf8");
    const digest = createHash("sha256").update(content).digest("hex").slice(0, 10);
    const kind = normalizedMime.startsWith("video/") ? "videos" : "images";
    const filename = `${kind === "images" ? "image" : "video"}-${String(resourceIndex).padStart(2, "0")}-${digest}${extension}`;
    resourceByDataUri.set(dataUri, {
      content,
      outputPath: join(outputRoot, "assets", kind, filename),
      publicPath: `assets/${kind}/${filename}`,
    });
  }
  return resourceByDataUri.get(dataUri).publicPath;
});

let videoAvailable = false;
try {
  await access(videoOutputPath);
  videoAvailable = true;
} catch {
  // The reference HTML intentionally contains an empty video frame.
}

if (videoAvailable) {
  const videoMarkup =
    `<video id="rawaiVideo" autoplay muted loop playsinline preload="auto" ` +
    `style="width:100%;height:100%;display:block;object-fit:cover">` +
    `<source src="assets/videos/${videoFilename}" type="video/mp4"/>` +
    `</video>`;
  html = html.replace(
    /(<div class="rawai-video-frame"[^>]*>)\s*(<\/div>)/i,
    `$1\n${videoMarkup}\n$2`,
  );
}

await Promise.all(
  [...resourceByDataUri.values()].map(({ content, outputPath }) => writeFile(outputPath, content)),
);

const styles = [];
html = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_tag, attributes, css) => {
  const id = /\bid\s*=\s*["']([^"']+)["']/i.exec(attributes)?.[1];
  const index = styles.length;
  const filename = index === 0 ? "style.css" : id ? `${id}.css` : `style-${index + 1}.css`;
  styles.push({ css: css.trim(), filename });
  return `<link rel="stylesheet"${id ? ` id="${id}"` : ""} href="css/${filename}"/>`;
});

const scripts = [];
const scriptFilenames = [
  "script.js",
  "fullscreen.js",
  "gallery-map-zoom.js",
  "simulator-layout.js",
  "premium-interactions.js",
  "rawai-video.js",
];
html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attributes, javascript) => {
  if (/\bsrc\s*=/i.test(attributes)) return tag;
  scripts.push(javascript.trim());
  const part = scripts.length - 1;
  const preservedAttributes = attributes.trim();
  return `<script${preservedAttributes ? ` ${preservedAttributes}` : ""} src="js/${scriptFilenames[part]}"></script>`;
});

if (videoAvailable && scripts[5]) {
  scripts[5] = `(() => {
  const video = document.getElementById('rawaiVideo');
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;

  const tryPlay = () => {
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') promise.catch(() => {});
  };

  const enableSound = () => {
    video.muted = false;
    video.defaultMuted = false;
    tryPlay();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryPlay, { once: true });
  } else {
    tryPlay();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlay();
  });

  document.addEventListener('pointerdown', enableSound, { once: true, passive: true });
  document.addEventListener('keydown', enableSound, { once: true });
})();`;
}

const agenceHtml = html
  .replace(
    /<a\b(?=[^>]*\bclass=["'][^"']*\bcta\b[^"']*["'])(?=[^>]*\bdata-i18n=["']waViewing["'])[^>]*>[\s\S]*?<\/a>/i,
    "",
  )
  .replace(
    /<section\b(?=[^>]*\bclass=["'][^"']*\bcontact\b[^"']*["'])(?=[^>]*\bid=["']contact["'])[^>]*>[\s\S]*?<\/section>/i,
    "",
  );

await Promise.all([
  writeFile(join(outputRoot, "index.html"), html, "utf8"),
  writeFile(join(outputRoot, "agence.html"), agenceHtml, "utf8"),
  ...styles.map(({ css, filename }) =>
    writeFile(
      join(outputRoot, "css", filename),
      `${css.replaceAll("assets/images/", "../assets/images/")}\n`,
      "utf8",
    ),
  ),
  ...scripts.map((javascript, index) =>
    writeFile(join(outputRoot, "js", scriptFilenames[index]), `${javascript}\n`, "utf8"),
  ),
  writeFile(join(outputRoot, "assets/videos/.gitkeep"), "", "utf8"),
  writeFile(join(outputRoot, "assets/icons/.gitkeep"), "", "utf8"),
]);

const sourceStats = {
  source: basename(sourcePath),
  sourceExtension: extname(sourcePath),
  styleBlocks: styles.length,
  scriptBlocks: scripts.length,
  embeddedResources: resourceByDataUri.size,
};
console.log(JSON.stringify(sourceStats, null, 2));
