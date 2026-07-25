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
    length: 7136,
    sha256: "50469a61ac8028bcf9024c39d6157c6ce4968fa923666d38b6da3580f0c7c94a",
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

  assert.equal(tags.length, 1964);
  assert.equal(hash(tags), "d73717b39064f5207fb851d71f0192d19dfccd61845c06af4ac4f7bfe9862c6c");
});

test("preserva os dois CTAs do checkout Hotmart", () => {
  const checkout = /<a\b[^>]*href="https:\/\/pay\.hotmart\.com\/H106868076T\?checkoutMode=10"/gi;
  assert.equal(count(checkout), 2);
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
