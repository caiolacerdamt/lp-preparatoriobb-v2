import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { runInNewContext } from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(path.join(root, "index.html"), "utf8");

function count(pattern) {
  return [...html.matchAll(pattern)].length;
}

function hash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? "";
}

function contentFingerprint() {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|quot|#39|apos);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    length: text.length,
    sha256: createHash("sha256").update(text).digest("hex"),
  };
}

test("preserva integralmente o conteúdo textual e as imagens", () => {
  assert.deepEqual(contentFingerprint(), {
    length: 7324,
    sha256: "55d64b691230a69335a4a0f9bb821a48c6450d09f67655e8e2a561cefbd52205",
  });
  assert.equal(count(/<img\b/gi), 32);

  const imageContract = [...html.matchAll(/<img\b[^>]*>/gi)].map(([tag]) =>
    ["src", "srcset", "width", "height", "alt"].map((name) => attribute(tag, name)),
  );
  assert.equal(hash(imageContract), "1f39300d978adfd6a9de6c4461ba02b80b62705c3907f6fcb175cd2c2d7edf28");
});

test("preserva a estrutura de elementos do corpo da página", () => {
  let body = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? "";
  body = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "<script></script>")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "<style></style>")
    .replace(/<!--[\s\S]*?-->/g, "");
  const tags = [...body.matchAll(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi)].map(
    ([tag, name]) => `${tag[1] === "/" ? "/" : ""}${name.toLowerCase()}`,
  );

  assert.equal(tags.length, 2040);
  assert.equal(hash(tags), "1eeda0767b5aaaaf820c7367dbe38bbf07f3724f98d524393a957ea81b64917a");
});

test("preserva os dois CTAs do checkout Hotmart", () => {
  const checkout = /<a\b[^>]*href="https:\/\/pay\.hotmart\.com\/H106868076T\?checkoutMode=10"/gi;
  assert.equal(count(checkout), 2);
});

test("exibe a ancoragem e as condições atualizadas nos dois CTAs", () => {
  assert.equal(count(/class="bb-cta-anchor"/gi), 2);
  assert.equal(count(/De <del>R\$ 738,13<\/del> por apenas:/gi), 2);
  assert.equal(count(/class="bb-cta-installment"><span>9x de<\/span><strong><small>R\$<\/small>7,45<\/strong>/gi), 2);
  assert.equal(count(/ou R\$ 67,00 à vista/gi), 2);
  assert.equal(count(/Garantia incondicional de 7 dias: se não fizer sentido, devolvemos 100%\./gi), 2);
  assert.equal(count(/QUERO COMEÇAR MINHA PREPARAÇÃO →/gi), 2);
  assert.doesNotMatch(html, /Referência de mercado consultada em 22\/07\/2026/);
});

test("mantém visíveis os containers que abrigam os novos CTAs", () => {
  assert.doesNotMatch(html, /\.oferta-card \[data-id="8fe49d9"\],/);
  assert.doesNotMatch(html, /\.oferta-card \[data-id="c4d15d6"\],/);
  assert.match(html, /\.oferta-card \[data-id="8fe49d9"\] > \[data-id="04cd8e1"\]/);
  assert.match(html, /\.oferta-card \[data-id="c4d15d6"\] > \[data-id="f45c50b"\]/);
});

test("posiciona os sinais de confiança abaixo dos CTAs e usa ícones SVG", () => {
  const benefits = [...html.matchAll(/class="bb-cta-benefits"/gi)].map((match) => match.index);
  const buttons = [
    html.indexOf('data-id="b2c9fc7"'),
    html.indexOf('data-id="026dfab"'),
  ];

  assert.equal(benefits.length, 2);
  assert.ok(benefits[0] > buttons[0]);
  assert.ok(benefits[1] > buttons[1]);
  assert.doesNotMatch(html, /✅|🛡️|🔒/);
  assert.equal(count(/class="bb-cta-icon"/gi), 8);
});

test("não reserva espaço extra abaixo dos benefícios nos cards", () => {
  assert.match(html, /\.elementor-1619 \.elementor-element\.elementor-element-5027466\.oferta-card,\s*\.elementor-1619 \.elementor-element\.elementor-element-35585cb\.oferta-card \{ max-width: 480px; width: 100%; min-height: auto; \}/);
  assert.match(html, /\.elementor-1619 \.oferta-card \{ min-height: auto !important; \}/);
});

test("preserva Meta Pixel e Microsoft Clarity", () => {
  assert.equal(count(/fbq\('init', '1346343306919239'\)/g), 1);
  assert.equal(count(/fbq\('track', 'PageView'\)/g), 1);
  assert.equal(count(/https:\/\/connect\.facebook\.net\/en_US\/fbevents\.js/g), 1);
  assert.equal(count(/https:\/\/www\.clarity\.ms\/tag\//g), 1);
  assert.equal(count(/xrr8ob1igr/g), 1);
});

test("preserva Utmify e atribuição do Meta no checkout", () => {
  const utmify = [...html.matchAll(/<script\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .find((tag) => tag.includes("https://cdn.utmify.com.br/scripts/utms/latest.js"));
  assert.ok(utmify);
  assert.match(utmify, /\basync\b/);
  assert.match(utmify, /\bdefer\b/);
  assert.match(utmify, /\bdata-utmify-prevent-subids\b/);

  const attribution = html.match(
    /<!-- Repasse fbclid[\s\S]*?-->\s*<script>([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(attribution);

  const listeners = {};
  const anchor = {
    href: "https://pay.hotmart.com/H106868076T?checkoutMode=10",
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
  };
  runInNewContext(attribution, {
    URL,
    URLSearchParams,
    decodeURIComponent,
    document: {
      cookie: "_fbc=fb.1.123.cookie-click; _fbp=fb.1.456.789",
      querySelectorAll: () => [anchor],
    },
    window: {
      location: {
        origin: "https://preparatorio.passouconcursos.com",
        search: "?fbclid=query-click",
      },
    },
  });
  listeners.click();

  const checkout = new URL(anchor.href);
  assert.equal(checkout.searchParams.get("checkoutMode"), "10");
  assert.equal(checkout.searchParams.get("fbclid"), "query-click");
  assert.equal(checkout.searchParams.get("fbc"), "fb.1.123.cookie-click");
  assert.equal(checkout.searchParams.get("fbp"), "fb.1.456.789");
});
