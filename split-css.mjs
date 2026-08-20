// Separa o CSS inline do index.html em critico (o que pinta a dobra, continua
// inline) e resto (tudo, carregado de forma assincrona a partir de assets/css).
//
// Roda contra o servidor local do proprio repositorio (porta 8713), nao contra a
// copia .perf/base -- senao as mudancas da Fase 1 (fundo mobile do heroi) ficariam
// de fora do critico.
//
// Uso: node split-css.mjs

import { chromium } from 'playwright';
import { transform } from 'lightningcss';
import fs from 'node:fs';

// A dobra em 412x823 e o heroi (0-600px) mais o topo de .bb-prova-social (600-2031px).
// .bb-prova-social e uma <section> simples, fora do conjunto .e-con.e-parent, e por
// isso nao aparece na numeracao dos containers do Elementor. 7645bead fica em 2031px,
// abaixo da dobra, mas entra tambem por seguranca (custa pouco).
const CRITICOS = ['.elementor-element-2e23fbc', '.bb-prova-social', '.elementor-element-7645bead'];

// Familias que so aparecem abaixo da dobra: ficam apenas no resto.css. Carregam com
// font-display: swap, entao trocam sem texto invisivel e sem mudanca no visual final.
const FONTES_ADIADAS = ['Inter Tight', 'Questrial', 'Open Sans'];
// Dos Poppins, so 700 e 900 sao usados na dobra.
const POPPINS_CRITICOS = ['700', '900'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 823 } });
await page.goto('http://127.0.0.1:8713/', { waitUntil: 'load' });
await page.waitForTimeout(1500);

const { critico, resto, ignorados } = await page.evaluate(({ sels, adiadas, poppins }) => {
  const raizes = sels.flatMap(s => [...document.querySelectorAll(s)]);
  const ehCritico = (el) => el === document.documentElement || el === document.body
    || raizes.some(r => r === el || r.contains(el));
  const bate = (sel) => { try { for (const el of document.querySelectorAll(sel)) if (ehCritico(el)) return true; return false; } catch { return true; } };

  // @font-face: no critico so entram Poppins 700 e 900.
  const fonteEhCritica = (regra) => {
    const fam = (regra.style.getPropertyValue('font-family') || '').replace(/["']/g, '').trim();
    if (adiadas.includes(fam)) return false;
    if (fam === 'Poppins') return poppins.includes((regra.style.getPropertyValue('font-weight') || '').trim());
    return true;
  };

  const crit = [], rest = [];
  let ignorados = 0;
  for (const sh of document.styleSheets) {
    let regras; try { regras = sh.cssRules; } catch { continue; }
    // o bloco de content-visibility da Fase 1 continua inline, fora da separacao
    if (sh.ownerNode && sh.ownerNode.tagName === 'STYLE'
        && sh.ownerNode.textContent.includes('content-visibility: auto')) { ignorados++; continue; }
    for (const r of regras) {
      // A regra critica e DUPLICADA, nao movida: o resto.css precisa manter todas as
      // regras na ordem original, senao promover uma regra para o bloco critico a
      // adianta na cascata e inverte desempates entre seletores de mesma
      // especificidade (ex.: .enfim-card vs .e-con-full, que decidem por ordem).
      if (r.type === CSSRule.STYLE_RULE) { if (bate(r.selectorText)) crit.push(r.cssText); rest.push(r.cssText); }
      else if (r.type === CSSRule.MEDIA_RULE) {
        const sub = [];
        for (const s of r.cssRules) if (s.type === CSSRule.STYLE_RULE && bate(s.selectorText)) sub.push(s.cssText);
        if (sub.length) crit.push('@media ' + r.conditionText + '{' + sub.join('') + '}');
        rest.push(r.cssText);
      } else if (r.type === CSSRule.FONT_FACE_RULE) {
        if (fonteEhCritica(r)) crit.push(r.cssText);
        rest.push(r.cssText);
      } else { crit.push(r.cssText); rest.push(r.cssText); }
    }
  }
  return { critico: crit.join('\n'), resto: rest.join('\n'), ignorados };
}, { sels: CRITICOS, adiadas: FONTES_ADIADAS, poppins: POPPINS_CRITICOS });
await browser.close();

if (ignorados !== 1) throw new Error(`esperava ignorar 1 bloco de content-visibility, ignorei ${ignorados}`);

const min = (css) => transform({ filename: 'x.css', code: Buffer.from(css), minify: true }).code.toString();
const criticoMin = min(critico);
const restoMin = min(resto);

// Os caminhos do resto.css viram absolutos a partir da raiz do site.
//
// Nao da para usar ../images/ e ../fonts/ (relativo ao arquivo CSS): boa parte dos
// fundos do Elementor chega por custom property (--wpr-bg-*: url(...)), e um url()
// relativo dentro de custom property e resolvido contra a URL do *documento*, nao a
// da folha de estilo. Com ../images/ o navegador pediria /images/... e tomava 404.
// /assets/... e resolvido igual nos dois casos. A LP e servida na raiz do dominio e
// nao ha <base> na pagina.
const restoReescrito = restoMin
  .replaceAll('assets/images/', '/assets/images/')
  .replaceAll('assets/fonts/',  '/assets/fonts/');

fs.mkdirSync('.perf', { recursive: true });
fs.writeFileSync('.perf/critico.css', criticoMin);
fs.writeFileSync('.perf/resto.css', restoMin);
fs.mkdirSync('assets/css', { recursive: true });
fs.writeFileSync('assets/css/resto.css', restoReescrito);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';
console.log('critico', kb(criticoMin), '| resto', kb(restoMin), '| resto reescrito', kb(restoReescrito));
const sobrando = restoReescrito.match(/(^|[^/])assets\/(images|fonts)\//g);
if (sobrando) throw new Error(`caminhos nao reescritos no resto.css: ${sobrando.length}`);
const urls = [...restoReescrito.matchAll(/url\(([^)]*)\)/g)].map(m => m[1].replace(/["']/g, ''));
const ruins = urls.filter(u => !u.startsWith('/assets/') && !u.startsWith('data:'));
if (ruins.length) throw new Error(`url() fora de /assets/: ${ruins.join(', ')}`);
console.log(`caminhos: ${urls.length} url(), todos absolutos em /assets/`);
