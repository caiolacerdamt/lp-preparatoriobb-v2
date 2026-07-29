// Redimensiona e reencoda as imagens de assets/images para o tamanho que a pagina
// realmente exibe, e gera variantes mobile para as que mudam muito de um breakpoint
// para o outro.
//
// As larguras vieram de medicao no navegador (390px e 1440px de viewport), nao de
// estimativa: `alvo` cobre o maior uso em desktop, `mobile` cobre 2x o uso em 390px.
// Onde os dois numeros ficam perto, nao vale a pena ter duas versoes e so o `alvo` e
// gerado.
//
// Uso: node optimize-images.mjs [--dry]
// Nao vai para o deploy (o workflow copia apenas index.html e assets/).

import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(raiz, "assets/images");
const origem = path.join(raiz, ".imagens-originais");
const seco = process.argv.includes("--dry");

// alvo  = largura maxima final do arquivo principal
// mobile = largura da variante -mobile (omitida quando nao compensa)
// variantes = larguras adicionais nomeadas; sem alvo, preserva o principal
const plano = [
  { arq: "hero-comparativo-proximo-passo-v3.webp", alvo: 1671, mobile: 760 },
  { arq: "ruminacoes-novas-v2.webp", alvo: 1448, mobile: 760 },
  { arq: "combo-nobg.webp", alvo: 960, mobile: 700 },
  { arq: "autoridade-v4-nobg.webp", alvo: 900, mobile: 700 },
  { arq: "feedback1.webp", alvo: 760 },
  { arq: "feedback2.webp", alvo: 760 },
  { arq: "feedback5.webp", alvo: 700 },
  { arq: "feedback6.webp", alvo: 700 },
  { arq: "feedback8.webp", alvo: 700 },
  { arq: "logo-preparatorio-nobg.webp", alvo: 460 },
  {
    arq: "logo-proximo-passo-nobg.webp",
    variantes: [
      { sufixo: "-250", largura: 250 },
      { sufixo: "-420", largura: 420 },
      { sufixo: "-640", largura: 640 },
    ],
  },
  { arq: "sistema-estudos-nobg.webp", alvo: 500 },
  { arq: "mais-2000-questoes.webp", alvo: 300 },
  { arq: "decorex-nobg.webp", alvo: 360 },
  { arq: "capa-apostila-v2-nobg.webp", alvo: 290 },
  { arq: "comunidade-nobg.webp", alvo: 320 },
  { arq: "secao-para-voce-bg.webp", alvo: 1600, mobile: 800 },
  { arq: "banner-fundo-hero.webp", alvo: 1600 },
];

// Guarda os originais uma unica vez, para o script poder rodar de novo sem
// reencodar em cima de arquivo ja degradado.
try {
  await fs.access(origem);
} catch {
  await fs.mkdir(origem, { recursive: true });
  for (const { arq } of plano) {
    await fs.copyFile(path.join(dir, arq), path.join(origem, arq)).catch(() => {});
  }
  console.log(`originais copiados para .imagens-originais/\n`);
}

const opcoesWebp = { quality: 78, effort: 6, smartSubsample: true };
let antes = 0;
let depois = 0;

for (const { arq, alvo, mobile, variantes = [] } of plano) {
  const src = path.join(origem, arq);
  let buf;
  try {
    buf = await fs.readFile(src);
  } catch {
    try {
      buf = await fs.readFile(path.join(dir, arq));
      if (!seco) {
        await fs.mkdir(origem, { recursive: true });
        await fs.writeFile(src, buf);
        console.log(`original preservado em .imagens-originais/${arq}`);
      }
    } catch {
      console.log(`  (pulado, sem original) ${arq}`);
      continue;
    }
  }

  const meta = await sharp(buf).metadata();
  const tamOriginal = buf.length;
  antes += tamOriginal;

  const saidas = [];
  if (alvo) saidas.push({ nome: arq, largura: Math.min(alvo, meta.width) });
  if (mobile && mobile < meta.width) {
    saidas.push({ nome: arq.replace(/\.webp$/, "-mobile.webp"), largura: mobile });
  }
  for (const { sufixo, largura } of variantes) {
    saidas.push({ nome: arq.replace(/\.webp$/, `${sufixo}.webp`), largura });
  }

  if (!alvo) depois += tamOriginal;

  const linhas = [];
  for (const { nome, largura } of saidas) {
    const out = await sharp(buf)
      .resize({ width: largura, withoutEnlargement: true })
      .webp(opcoesWebp)
      .toBuffer();
    depois += out.length;
    if (!seco) await fs.writeFile(path.join(dir, nome), out);
    linhas.push(`${String(largura).padStart(4)}w ${(out.length / 1024).toFixed(1).padStart(6)} KB  ${nome}`);
  }

  console.log(
    `${meta.width}w ${(tamOriginal / 1024).toFixed(1)} KB  ${arq}\n` +
      linhas.map((l) => "    -> " + l).join("\n")
  );
}

console.log(
  `\nTOTAL: ${(antes / 1024).toFixed(1)} KB -> ${(depois / 1024).toFixed(1)} KB ` +
    `(inclui as variantes mobile; economia ${((antes - depois) / 1024).toFixed(1)} KB)`
);
if (seco) console.log("(dry run, nada gravado)");
