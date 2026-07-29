import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

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

test("prioriza somente o background que determina o LCP", () => {
  const imagePreloads = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => attribute(tag, "rel") === "preload" && attribute(tag, "as") === "image");

  assert.equal(imagePreloads.length, 1);
  assert.equal(attribute(imagePreloads[0], "href"), "assets/images/banner-fundo-hero.webp");
  assert.equal(attribute(imagePreloads[0], "type"), "image/webp");
  assert.equal(attribute(imagePreloads[0], "fetchpriority"), "high");

  const highPriorityImages = [...activeHtml.matchAll(/<img\b[^>]*fetchpriority="high"[^>]*>/gi)];
  assert.equal(highPriorityImages.length, 0);
});

test("mantém a imagem comparativa responsiva sem disputar prioridade com o LCP", () => {
  const [logo] = [...activeHtml.matchAll(/<img\b[^>]*logo-proximo-passo-nobg\.webp[^>]*>/gi)];
  const [hero] = [...activeHtml.matchAll(/<img\b[^>]*hero-comparativo-proximo-passo-v3\.webp[^>]*>/gi)];
  assert.ok(logo);
  assert.doesNotMatch(logo[0], /fetchpriority=/);
  assert.ok(hero);
  assert.doesNotMatch(hero[0], /fetchpriority=/);
  assert.match(hero[0], /srcset="assets\/images\/hero-comparativo-proximo-passo-v3-mobile\.webp 760w, assets\/images\/hero-comparativo-proximo-passo-v3\.webp 1671w"/);
});

test("entrega todas as logos em variantes Retina responsivas", async () => {
  const logos = [...activeHtml.matchAll(/<img\b[^>]*src="assets\/images\/logo-proximo-passo-nobg\.webp"[^>]*>/gi)]
    .map(([tag]) => tag);
  const expectedSrcset = [
    "assets/images/logo-proximo-passo-nobg-250.webp 250w",
    "assets/images/logo-proximo-passo-nobg-420.webp 420w",
    "assets/images/logo-proximo-passo-nobg-640.webp 640w",
  ].join(", ");

  assert.equal(logos.length, 4);
  assert.deepEqual(logos.map((tag) => attribute(tag, "srcset")), Array(4).fill(expectedSrcset));
  assert.deepEqual(logos.map((tag) => attribute(tag, "sizes")), [
    "(max-width: 767px) 125px, (max-width: 1024px) 170px, (max-width: 1366px) 190px, 210px",
    "(max-width: 767px) 220px, 260px",
    "(max-width: 767px) 220px, 260px",
    "(max-width: 767px) 150px, 170px",
  ]);

  for (const width of [250, 420, 640]) {
    const image = await readFile(path.join(root, "assets", "images", `logo-proximo-passo-nobg-${width}.webp`));
    const metadata = await sharp(image).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, width);
  }
});

test("entrega o feedback destacado em variantes Retina responsivas", async () => {
  const [feedback] = activeHtml.match(/<img\b[^>]*src="assets\/images\/feedback-novo\.webp"[^>]*>/i) ?? [];
  assert.ok(feedback);
  assert.equal(
    attribute(feedback, "srcset"),
    "assets/images/feedback-novo-480.webp 480w, assets/images/feedback-novo-800.webp 800w, assets/images/feedback-novo-960.webp 960w, assets/images/feedback-novo.webp 1206w",
  );
  assert.equal(
    attribute(feedback, "sizes"),
    "(max-width: 767px) calc(100vw - 46px), (max-width: 1024px) calc(50vw - 45px), 350px",
  );
  assert.equal(attribute(feedback, "width"), "1206");
  assert.equal(attribute(feedback, "height"), "1336");
  assert.equal(attribute(feedback, "loading"), "lazy");
  assert.equal(attribute(feedback, "decoding"), "async");

  for (const width of [480, 800, 960]) {
    const image = await readFile(path.join(root, "assets", "images", `feedback-novo-${width}.webp`));
    const metadata = await sharp(image).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, width);
  }
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
