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

const { critico, resto, ignorados, soNoCritico } = await page.evaluate(({ sels, adiadas, poppins }) => {
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

  // Os fundos do Elementor passam por custom property: uma regra declara
  // (--wpr-bg-X: url(...)) e outra consome (background-image: var(--wpr-bg-X)).
  //
  // O navegador resolve esse url() relativo contra a folha que CONSOME o var(), nao
  // contra a que declara. Se as duas nao estiverem no mesmo arquivo, nenhum caminho
  // funciona: com a consumidora no resto.css (/assets/css/), "assets/images/" vira
  // /assets/css/assets/images/ e "../images/" resolvido pela consumidora inline vira
  // /images/ -- os dois 404. Caminho absoluto resolveria no servidor mas quebra ao
  // abrir o index.html do disco (/assets vira C:/assets).
  //
  // Por isso declaracao e consumo ficam SO no critico inline, onde a base e sempre a
  // do documento e o caminho relativo original vale em qualquer contexto.
  const declaraFundo = (r) => /--[\w-]+\s*:\s*url\(/.test(r.cssText)
                           || /var\(\s*--wpr-bg-/.test(r.cssText);

  const crit = [], rest = [];
  let ignorados = 0, soNoCritico = 0;
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
      // A unica excecao sao as regras que declaram fundo por custom property.
      if (r.type === CSSRule.STYLE_RULE) {
        if (declaraFundo(r)) { crit.push(r.cssText); soNoCritico++; }
        else { if (bate(r.selectorText)) crit.push(r.cssText); rest.push(r.cssText); }
      }
      else if (r.type === CSSRule.MEDIA_RULE) {
        const sub = [], restoSub = [];
        for (const s of r.cssRules) {
          if (s.type !== CSSRule.STYLE_RULE) { restoSub.push(s.cssText); continue; }
          if (declaraFundo(s)) { sub.push(s.cssText); soNoCritico++; continue; }
          if (bate(s.selectorText)) sub.push(s.cssText);
          restoSub.push(s.cssText);
        }
        if (sub.length) crit.push('@media ' + r.conditionText + '{' + sub.join('') + '}');
        if (restoSub.length) rest.push('@media ' + r.conditionText + '{' + restoSub.join('') + '}');
      } else if (r.type === CSSRule.FONT_FACE_RULE) {
        if (fonteEhCritica(r)) crit.push(r.cssText);
        rest.push(r.cssText);
      } else { crit.push(r.cssText); rest.push(r.cssText); }
    }
  }
  return { critico: crit.join('\n'), resto: rest.join('\n'), ignorados, soNoCritico };
}, { sels: CRITICOS, adiadas: FONTES_ADIADAS, poppins: POPPINS_CRITICOS });
await browser.close();

if (ignorados !== 1) throw new Error(`esperava ignorar 1 bloco de content-visibility, ignorei ${ignorados}`);

const min = (css) => transform({ filename: 'x.css', code: Buffer.from(css), minify: true }).code.toString();
const criticoMin = min(critico);
const restoMin = min(resto);

// Todo url() que sobrou no resto.css e url() comum, resolvido pelo navegador contra
// a URL da FOLHA (/assets/css/) -- por isso ../images/ e ../fonts/.
//
// Os url() de custom property nao chegam aqui: ficaram so no bloco critico inline
// (veja `declaraFundo` acima). Ali a base e a do documento e o caminho relativo
// original vale. Nao da para deixa-los no resto.css em nenhuma forma: /assets/...
// quebra ao abrir o arquivo do disco (vira C:/assets), ../images/ e assets/images/
// resolvem contra bases diferentes conforme o consumidor e produzem 404.
const restoReescrito = restoMin
  .replaceAll('assets/images/', '../images/')
  .replaceAll('assets/fonts/',  '../fonts/');

fs.mkdirSync('.perf', { recursive: true });
fs.writeFileSync('.perf/critico.css', criticoMin);
fs.writeFileSync('.perf/resto.css', restoMin);
fs.mkdirSync('assets/css', { recursive: true });
fs.writeFileSync('assets/css/resto.css', restoReescrito);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';
console.log('critico', kb(criticoMin), '| resto', kb(restoMin), '| resto reescrito', kb(restoReescrito));
console.log(`regras de fundo por custom property mantidas so no critico: ${soNoCritico}`);

// nenhum url() de custom property pode ter sobrado no resto.css
const cpNoResto = [...restoReescrito.matchAll(/--[\w-]+\s*:\s*url\(([^)]*)\)/g)];
if (cpNoResto.length) throw new Error(`url() de custom property vazou para o resto.css: ${cpNoResto.map(m => m[1]).join(', ')}`);

// e todo url() restante tem de ser relativo a folha
const urls = [...restoReescrito.matchAll(/url\(([^)]*)\)/g)].map(m => m[1].replace(/["']/g, ''));
const ruins = urls.filter(u => !u.startsWith('../') && !u.startsWith('data:'));
if (ruins.length) throw new Error(`url() nao relativo a folha no resto.css:\n  ${ruins.join('\n  ')}`);

// e as declaracoes de fundo tem de estar no critico, com o caminho do documento
const cpNoCritico = [...criticoMin.matchAll(/--[\w-]+:url\(([^)]*)\)/g)].map(m => m[1].replace(/["']/g, ''));
if (!cpNoCritico.length) throw new Error('nenhuma declaracao de fundo chegou ao critico');
// nenhuma regra pode continuar consumindo var(--wpr-bg-*) do resto.css: a declaracao
// dela nao esta la, entao o fundo simplesmente nao apareceria
if (/var\(\s*--wpr-bg-/.test(restoReescrito)) throw new Error('sobrou var(--wpr-bg-*) no resto.css sem a declaracao correspondente');
const cpRuins = cpNoCritico.filter(u => !u.startsWith('assets/'));
if (cpRuins.length) throw new Error(`declaracao de fundo com caminho errado: ${cpRuins.join(', ')}`);
console.log(`caminhos ok: ${urls.length} url() relativos a folha no resto.css, ${cpNoCritico.length} fundos relativos ao documento no critico`);
