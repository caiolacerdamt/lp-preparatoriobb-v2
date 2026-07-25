import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(path.join(root, "index.html"), "utf8");

function count(pattern) {
  return [...html.matchAll(pattern)].length;
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
});

test("preserva os dois CTAs do checkout Hotmart", () => {
  const checkout = /<a\b[^>]*href="https:\/\/pay\.hotmart\.com\/H106868076T\?checkoutMode=10"/gi;
  assert.equal(count(checkout), 2);
});

test("preserva Meta Pixel e Microsoft Clarity", () => {
  assert.equal(count(/fbq\('init', '1346343306919239'\)/g), 1);
  assert.equal(count(/fbq\('track', 'PageView'\)/g), 1);
  assert.equal(count(/xrr8ob1igr/g), 1);
});

test("preserva Utmify e atribuição do Meta no checkout", () => {
  assert.equal(count(/https:\/\/cdn\.utmify\.com\.br\/scripts\/utms\/latest\.js/g), 1);
  assert.match(html, /querySelectorAll\('a\[href\*="pay\.hotmart\.com"\]'\)/);
  assert.match(html, /u\.searchParams\.set\("fbclid", fbclid\)/);
  assert.match(html, /u\.searchParams\.set\("fbc", fbc\)/);
  assert.match(html, /u\.searchParams\.set\("fbp", fbp\)/);
});
