import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(path.join(root, "index.html"), "utf8");
const activeHtml = html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? "";
}

test("precarrega somente as fontes usadas na primeira dobra", () => {
  const fontPreloads = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => attribute(tag, "rel") === "preload" && attribute(tag, "as") === "font")
    .map((tag) => attribute(tag, "href"));

  assert.deepEqual(fontPreloads, [
    "assets/fonts/poppins-pxieyp8kv8jhgfvrjjfecg.woff2",
    "assets/fonts/poppins-pxibyp8kv8jhgfvrlcz7z1xlfq.woff2",
  ]);
});

test("carrega imediatamente somente logo e imagem principal", () => {
  const imageTags = [...activeHtml.matchAll(/<img\b[^>]*>/gi)].map(([tag]) => tag);
  const eagerSources = imageTags
    .filter((tag) => attribute(tag, "loading") !== "lazy")
    .map((tag) => attribute(tag, "src"));

  assert.deepEqual(eagerSources, [
    "assets/images/logo-proximo-passo-nobg.webp",
    "assets/images/hero-comparativo-proximo-passo-v3.webp",
  ]);
});

test("mantém prioridade alta na imagem principal responsiva", () => {
  const [logo] = [...activeHtml.matchAll(/<img\b[^>]*logo-proximo-passo-nobg\.webp[^>]*>/gi)];
  const [hero] = [...activeHtml.matchAll(/<img\b[^>]*hero-comparativo-proximo-passo-v3\.webp[^>]*>/gi)];
  assert.ok(logo);
  assert.match(logo[0], /fetchpriority="high"/);
  assert.ok(hero);
  assert.match(hero[0], /fetchpriority="high"/);
  assert.match(hero[0], /srcset="assets\/images\/hero-comparativo-proximo-passo-v3-mobile\.webp 760w, assets\/images\/hero-comparativo-proximo-passo-v3\.webp 1671w"/);
});

test("mantém font-display swap em todas as fontes locais", () => {
  const fontFaces = [...html.matchAll(/@font-face\s*\{[^}]*\}/gi)].map(([rule]) => rule);
  assert.equal(fontFaces.length, 8);
  for (const rule of fontFaces) assert.match(rule, /font-display:\s*swap/);
});

test("decodifica assincronamente todas as imagens visíveis abaixo da dobra", () => {
  const lazyImages = [...activeHtml.matchAll(/<img\b[^>]*loading="lazy"[^>]*>/gi)].map(([tag]) => tag);
  assert.equal(lazyImages.length, 23);
  for (const tag of lazyImages) assert.equal(attribute(tag, "decoding"), "async");
});
