# LCP e imagens responsivas Retina — Validation

**Date**: 2026-07-28
**Spec**: `docs/superpowers/specs/2026-07-28-lcp-imagens-responsivas-design.md`
**Diff range**: `d5789a7..HEAD` (`6d57832`, `d39d905`, `9ce79d3`)
**Verifier**: independent sub-agent (author ≠ verifier)

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion/evidence | Result |
| --- | --- | --- | --- |
| Prioridade do LCP | Exatamente 1 preload de imagem: `banner-fundo-hero.webp`, WebP, `fetchpriority="high"` | `tests/lp-performance.test.mjs:40` — coleta preloads; `:45-48` — `length === 1`, `href`, `type` e prioridade exatos | ✅ PASS |
| Logo e comparativo não disputam o LCP | Ambos eager; nenhum `<img>` com prioridade alta; comparativo continua responsivo | `tests/lp-performance.test.mjs:28-38` — eager sources exatos; `:50-61` — zero `<img fetchpriority="high">`, ausência do atributo e `srcset` exato | ✅ PASS |
| Hero preservado | CSS, dimensões, classes, `alt`, `sizes` e estrutura do comparativo não mudam | `index.html:3529-3534`; diff `d5789a7..HEAD` altera somente a remoção de `fetchpriority`; `tests/lp-integrity.test.mjs:61-72` — estrutura com 2.040 tags e hash `054f1c…b74b9` | ✅ PASS |
| Logo responsiva | Fallback original; 4 ocorrências com candidatos `250w/420w/640w` e `sizes` exatos por hero/cards/rodapé | `tests/lp-performance.test.mjs:64-82` — 4 ocorrências, `srcset` idêntico e lista exata de quatro `sizes`; implementação em `index.html:3500`, `:4138`, `:4420`, `:4656` | ✅ PASS |
| Contratos existentes das logos | `width`, `height`, `alt`, classes e lazy loading abaixo da dobra preservados | `tests/lp-integrity.test.mjs:48-59` — 32 imagens e hash exato do contrato `src/srcset/width/height/alt`; `tests/lp-performance.test.mjs:28-38`, `:120-123` — apenas 2 eager e 23 lazy com `decoding="async"`; diff mostra somente novos `srcset/sizes` e remoção da prioridade do hero | ✅ PASS |
| Feedback responsivo | Fallback `1206w`; candidatos `480w/800w/960w/1206w`; `sizes` mobile/tablet/desktop exato | `tests/lp-performance.test.mjs:90-101` — `srcset` e `sizes` por igualdade estrita; implementação em `index.html:3556` | ✅ PASS |
| Contratos existentes do feedback | `1206×1336`, lazy, async, `alt`, proporção e grid preservados | `tests/lp-performance.test.mjs:102-106`; `tests/lp-integrity.test.mjs:127-144` — tag completa e regras de grid/breakpoints exatas | ✅ PASS |
| Variantes válidas | Seis arquivos WebP existem nas larguras definidas | `tests/lp-performance.test.mjs:84-88`, `:108-112` — `sharp().metadata()` exige formato `webp` e largura exata. Medido: logo `250×83`/5.682 B, `420×140`/10.236 B, `640×213`/17.040 B; feedback `480×532`/22.836 B, `800×886`/43.072 B, `960×1063`/52.014 B | ✅ PASS |
| Pipeline reproduzível | Lê originais preservados; WebP quality 78; gera as seis variantes sem reencodar a saída anterior | `optimize-images.mjs:37-51`, `:62-74`, `:78-120`; regeneração read-only contra `.imagens-originais` produziu os mesmos bytes e SHA-256 nas 6/6 saídas | ✅ PASS |
| Conteúdo, CTAs e tracking | Meta Pixel, Clarity, Utmify, checkout, `fbclid`, `_fbc`, `_fbp`, UTMs/`xcod`/`sck` preservados | `tests/lp-integrity.test.mjs:93-125` — CTA/copy; `:178-184` — IDs e chamadas Meta/Clarity; `:186-229` — Utmify async/defer e repasse exato de `checkoutMode=10`, `fbclid=query-click`, `fbc=fb.1.123.cookie-click`, `fbp=fb.1.456.789`. Diff de `index.html` contém zero linhas de tracking | ✅ PASS |

**Status**: ✅ 10/10 critérios verificáveis no diff correspondem ao resultado exato da especificação; zero lacunas de precisão.

## Discrimination Sensor

Estado temporário fora do working tree; ao final, o `index.html` temporário foi restaurado ao mesmo SHA-256 do real (`9C8856655387CA155AB38B2A647A071D31F60C1C63B6671B9A0A256A39B2F03`).

| Mutation | File:line | Description | Killed? |
| --- | --- | --- | --- |
| 1 | `index.html:3419` | `fetchpriority="high"` → `"low"` | ✅ `lp-performance.test.mjs:48`, 1 falha |
| 2 | `index.html:3500` | Logo hero mobile `sizes` 125 px → 126 px | ✅ `lp-performance.test.mjs:75`, 1 falha |
| 3 | `index.html:3556` | Feedback desktop `sizes` 350 px → 351 px | ✅ `lp-performance.test.mjs:97` e `lp-integrity.test.mjs:130`, 2 falhas |

**Sensor depth**: lightweight (3 mutações)
**Result**: 3/3 killed — PASS ✅

## Gate Check

- **Command**: `node --test tests/*.test.mjs`
- **Result**: 22 passed, 0 failed, 0 skipped, 0 todo
- **Before feature**: 19 tests (`d5789a7`)
- **After feature**: 22 tests
- **Delta**: +3; nenhuma remoção ou enfraquecimento encontrado

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code; no scope creep or single-use abstraction | ✅ |
| Surgical diff; CSS/copy/CTA/tracking untouched | ✅ |
| Existing style and contracts preserved | ✅ |
| Tests map to spec outcomes and kill behavioral faults | ✅ |
| Guidelines followed: `tlc-spec-driven/references/coding-principles.md` | ✅ |

## Visual and Production Performance

O diff não altera CSS/layout e preserva dimensões declaradas; os contratos estruturais e responsivos passam. Auditorias Lighthouse repetidas, limpeza de CDN e PageSpeed pós-deploy dependem do ambiente publicado e permanecem como validação operacional de rollout, sem lacuna de implementação detectada neste gate.

## Summary

**Overall**: ✅ Ready
**Spec-anchored check**: 10/10
**Sensor**: 3/3 mutations killed
**Gate**: 22/22 passed
**Tracking/attribution**: preserved
**Lessons**: none recorded (clean PASS; no surviving mutant, failed AC, spec-precision gap or `SPEC_DEVIATION`)
