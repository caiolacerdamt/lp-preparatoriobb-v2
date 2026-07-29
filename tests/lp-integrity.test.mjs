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

function visibleText(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|quot|#39|apos);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
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
    length: 7237,
    sha256: "3f295fb395f9b5cba910168069f639a700ec7c7119871d14f71e480441c89b37",
  });
  assert.equal(count(/<img\b/gi), 32);

  const imageContract = [...html.matchAll(/<img\b[^>]*>/gi)].map(([tag]) =>
    ["src", "srcset", "width", "height", "alt"].map((name) => attribute(tag, name)),
  );
  assert.equal(hash(imageContract), "219a686a2c8a5304f079520addce7af25c4ba087bb84194b2c9d482ba76e5c04");
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
  assert.equal(hash(tags), "054f1c19ccf3c4289121df0fa80f29ce16ed7156c8ed4f9e1997f1167b5b74b9");
});

test("reposiciona a seta, alinha os indicadores e troca todas as logos", async () => {
  const socialStart = html.indexOf('<section class="bb-prova-social"');
  const socialContent = html.indexOf('<div class="bb-section-inner">', socialStart);
  const arrow = html.indexOf('data-id="c7ae53b"', socialStart);

  assert.equal(count(/data-id="c7ae53b"/gi), 1);
  assert.ok(arrow > socialStart && arrow < socialContent);
  assert.match(html, /elementor-element-221a096 \{[^}]*--flex-wrap-mobile: nowrap;[^}]*flex-wrap: nowrap;/i);
  assert.match(html, /elementor-element-315aa46,[\s\S]*?elementor-element-37eda66 \{[^}]*flex: 1 1 0;[^}]*width: calc\(50% - 4px\);/i);
  assert.equal(count(/logo-proximo-passo-nobg\.webp/gi), 4);
  assert.doesNotMatch(html, /logo-preparatorio-nobg\.webp/i);

  const logo = await readFile(path.join(root, "assets", "images", "logo-proximo-passo-nobg.webp"));
  assert.equal(logo.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(logo.subarray(8, 12).toString("ascii"), "WEBP");
  assert.ok(logo.byteLength < 60 * 1024, `WebP da logo excede 60 KB: ${logo.byteLength} bytes`);
});

test("preserva os dois CTAs do checkout Hotmart", () => {
  const checkout = /<a\b[^>]*href="https:\/\/pay\.hotmart\.com\/H106868076T\?checkoutMode=10"/gi;
  assert.equal(count(checkout), 2);
});

test("exibe a ancoragem e as condições atualizadas nos dois CTAs", () => {
  assert.equal(count(/class="bb-cta-anchor"/gi), 2);
  assert.equal(count(/De <del>R\$ 297,00<\/del> por apenas:/gi), 2);
  assert.equal(count(/class="bb-cta-installment"><span>9x de<\/span><strong><small>R\$<\/small>5,23<\/strong>/gi), 2);
  assert.equal(count(/ou R\$ 47,00 à vista/gi), 2);
  assert.equal(count(/Garantia incondicional de 7 dias: se não fizer sentido, devolvemos 100%\./gi), 2);
  assert.equal(count(/QUERO COMEÇAR MINHA PREPARAÇÃO →/gi), 2);
  assert.doesNotMatch(html, /Referência de mercado consultada em 22\/07\/2026/);
});

test("exibe a nova promessa principal sem alterar sua redação", () => {
  const hero = html.match(/data-id="1bdaf01"[\s\S]*?<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "";
  assert.equal(
    visibleText(hero),
    "Pare de esperar o edital pra começar. O Método Próximo Passo BB te diz o que estudar hoje, mesmo começando do zero.",
  );
});

test("ancora os quatro itens da oferta em exatamente R$ 297,00", () => {
  const section = html.match(/Recapitulando[\s\S]*?Soluções equivalentes[\s\S]*?<\/section>/i)?.[0] ?? "";
  const expectedPrices = ["147,00", "60,00", "40,00", "50,00"];

  for (const price of expectedPrices) {
    assert.equal([...section.matchAll(new RegExp(`R\\$ ${price}`, "g"))].length, 1);
  }
  assert.match(section, /somam <strong><del>R\$ 297,00<\/del><\/strong>/i);
  assert.doesNotMatch(section, /R\$ (?:430,92|121,41|59,89|125,91|738,13)/);
});

test("exibe cinco feedbacks em um grid bento responsivo sem cortes", async () => {
  assert.equal(count(/class="bb-feedback-card(?: bb-feedback-card--featured)?"/gi), 5);
  assert.doesNotMatch(html, /src="assets\/images\/feedback1\.webp"/i);
  assert.match(
    html,
    /<figure class="bb-feedback-card bb-feedback-card--featured"><img src="assets\/images\/feedback-novo\.webp" width="1206" height="1336" loading="lazy" decoding="async" alt="Feedback sobre evolução de 38% para 72% de acertos em duas semanas">/i,
  );
  assert.match(html, /\.bb-feedback-grid \{[^}]*display: grid;[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);[^}]*grid-template-areas: "feedback-a feedback-b feedback-featured" "feedback-c feedback-d feedback-featured";/i);
  assert.match(html, /\.bb-feedback-card--featured \{ grid-area: feedback-featured;/i);
  assert.match(html, /@media \(max-width: 1024px\)[\s\S]*?grid-template-areas: "feedback-a feedback-b" "feedback-c feedback-d" "feedback-featured feedback-featured";[\s\S]*?\.bb-feedback-card--featured \{ width: calc\(50% - 9px\); justify-self: center; \}/i);
  assert.match(html, /@media \(max-width: 767px\)[\s\S]*?grid-template-areas: "feedback-a" "feedback-b" "feedback-c" "feedback-d" "feedback-featured";[\s\S]*?\.bb-feedback-card--featured \{ width: 100%; \}/i);
  assert.doesNotMatch(html, /\.bb-feedback-card img \{[^}]*object-fit:\s*cover/i);
  assert.doesNotMatch(html, /feedback\.jpe?g/i);

  const image = await readFile(path.join(root, "assets", "images", "feedback-novo.webp"));
  assert.equal(image.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(image.subarray(8, 12).toString("ascii"), "WEBP");
  assert.ok(image.byteLength <= 100 * 1024, `WebP excede 100 KB: ${image.byteLength} bytes`);
});

test("oferece Pix e cartão no FAQ com os preços atualizados", () => {
  assert.match(html, /Pix à vista por R\$ 47,00 ou cartão em até 9x de R\$ 5,23\./i);
  assert.doesNotMatch(html, /R\$ 738,13|R\$ 67,00|R\$ 7,45/);
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
