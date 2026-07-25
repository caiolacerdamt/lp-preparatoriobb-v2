# Otimização de desempenho da landing page — Validação

**Data**: 2026-07-25  
**Spec fonte de verdade**: `docs/superpowers/specs/2026-07-25-otimizacao-desempenho-lp-design.md`  
**Diff validado**: `de3b3e2..HEAD` (`3530f44`, `e5dee3c`, `4536673`)  
**Verificador**: subagente independente (autor != verificador)  
**Veredito**: **FAIL**

## Resumo executivo

O gate está verde, mas não é discriminante para todo o contrato da spec. Uma mutação que removeu o texto alternativo de uma imagem sobreviveu com 8/8 testes. Além disso, não há implementação nem teste para a minificação obrigatória do CSS inline, e a validação independente não rederivou o fluxo em desktop. A feature ainda não satisfaz o critério de conclusão.

## Task Completion

| Entrega | Status | Evidência |
| --- | --- | --- |
| Testes de integridade | Concluída | `3530f44`; `tests/lp-integrity.test.mjs:31-56` |
| Lazy-load e preloads de fontes | Parcial | `e5dee3c`; cobre imagens e preloads, mas não minifica CSS nem demonstra otimização de scripts |
| Decisão de não adicionar `.htaccess` | Concluída | `4536673`; spec `:35` e ausência do arquivo no diff/repositório |

## Cobertura spec-anchored

| Critério da spec | Resultado esperado | Evidência `file:line` + asserção | Resultado exato |
| --- | --- | --- | --- |
| Preservar textos **e estrutura** (`spec:17-18`) | Texto e estrutura equivalentes ao baseline | `tests/lp-integrity.test.mjs:32-35` — `assert.deepEqual(contentFingerprint(), { length, sha256 })`; o helper remove todas as tags em `:17-23` | **GAP** — cobre texto, não estrutura |
| Preservar quantidade e destino dos CTAs (`spec:19`) | Exatamente 2 links para `H106868076T?checkoutMode=10` | `tests/lp-integrity.test.mjs:40-41` — `assert.equal(count(checkout), 2)` | **PASS** |
| Preservar IDs e carregamento de Meta Pixel e Clarity (`spec:20`) | IDs, inicialização e carregamento funcionais | `tests/lp-integrity.test.mjs:45-47` — contagens de `fbq(init)`, `fbq(PageView)` e `xrr8ob1igr` | **GAP** — presença textual não prova carregamento |
| Preservar Utmify e atribuição (`spec:21`) | Script carregado e `fbclid`, `fbc`, `fbp` repassados ao checkout | `tests/lp-integrity.test.mjs:51-55` — URL e chamadas `searchParams.set(...)` | **GAP** — presença textual não exercita carregamento nem efeito runtime |
| Logo e hero com prioridade alta (`spec:23`) | Somente logo e hero eager; ambos prioritários | `tests/lp-performance.test.mjs:33-36` — lista eager exata; `:41-43` — hero existe, tem `fetchpriority="high"` e `srcset` exato | **GAP** — prioridade alta do logo não é afirmada |
| Lazy-load somente abaixo da dobra (`spec:24`) | 23 imagens abaixo da dobra lazy; somente logo e hero eager | `tests/lp-performance.test.mjs:33-36` e `:47-49` — lista eager exata, `lazyImages.length === 23`, `decoding === "async"` | **PASS** |
| Preservar `srcset`, dimensões, `alt` e todas as imagens (`spec:25`) | Todos os atributos equivalentes ao baseline | `tests/lp-integrity.test.mjs:36` — apenas `assert.equal(count(/<img\b/gi), 32)`; hero `srcset` isolado em `tests/lp-performance.test.mjs:43` | **FAIL** — mutante de `alt` sobreviveu |
| Manter `font-display: swap` (`spec:27`) | Todas as fontes continuam com `swap` | Evidência de implementação em `index.html:3`, `:23`, `:3097-3107`; nenhuma asserção | **GAP (evidence-or-zero)** |
| Preload somente do primeiro viewport (`spec:28`) | Apenas fontes comprovadamente usadas acima da dobra | `tests/lp-performance.test.mjs:21-24` — lista exata de 2 arquivos | **Spec-precision gap** — a spec não identifica quais arquivos/pesos compõem o primeiro viewport |
| Preservar famílias, pesos e aparência (`spec:29`) | Definições e renderização equivalentes | Nenhuma asserção | **GAP** |
| Preservar tracking integralmente e aplicar `defer` com segurança (`spec:30-33`) | Scripts equivalentes; somente scripts locais seguros recebem `defer`; dependências Elementor intactas | Nenhuma asserção integral/de ordem/de dependência; o diff não remove scripts | **GAP** |
| Minificar CSS inline com Lightning CSS (`spec:34`) | CSS inline minificado sem remoção de seletores | Nenhuma mudança de CSS no diff e nenhuma asserção | **FAIL — não implementado** |
| Não adicionar `.htaccess` (`spec:35`) | Arquivo ausente | Ausência no repositório/diff; nenhuma asserção | **PASS de implementação; GAP automatizado** |
| Verificar mobile e desktop, primeira dobra, imagens, FAQ, CTAs e console (`spec:49-50`) | Ambos viewports funcionam sem erro | Contexto do autor cobre mobile 390x844 e zero erros; nenhuma evidência independente de desktop | **GAP** |
| Entregar menos trabalho e menos bytes (`spec:52`, `:67`) | Redução inequívoca do carregamento inicial | Blob HTML: 459108 -> 459136 bytes; gzip-9: 56813 -> 56797; Brotli: 43833 -> 43842; preloads de fonte: 4 -> 2; lazy: 6 -> 23 | **FAIL/PARCIAL** — menos trabalho, mas bytes não diminuem em raw/Brotli |

**Cobertura exata automatizada**: 2/15 obrigações integralmente cobertas; 1 spec-precision gap; demais parciais, sem evidência ou falhas.

## Gate obrigatório

- **Comando**: `node --test tests/*.test.mjs`
- **Resultado**: 8 passed, 0 failed, 0 skipped, 0 cancelled
- **Baseline antes da feature**: 0 testes
- **Delta**: +8 testes
- **Integridade**: nenhum teste removido, pulado ou enfraquecido no intervalo

## Discrimination Sensor

O sensor foi executado somente em `.verifier-scratch`; os arquivos temporários foram descartados e a implementação/testes reais não foram alterados.

| # | Mutação comportamental | Cobertura acionada | Resultado |
| --- | --- | --- | --- |
| M1 | Remover `loading="lazy"` de `ruminacoes-novas-v2.webp` (`index.html:3528`) | `tests/lp-performance.test.mjs:33-36`, `:47-49` | **MORTO** — 6 passed, 2 failed |
| M2 | Substituir o `alt` da mesma imagem por string vazia (`index.html:3528`) | Gate completo | **SOBREVIVEU** — 8 passed, 0 failed |
| M3 | Terceira mutação planejada | — | **NÃO CONCLUÍDA** devido à interrupção; nenhuma conclusão inferida |

**Sensor depth**: lightweight  
**Resultado**: 1 morta, 1 sobrevivente, 1 não concluída — **FAIL**

## Qualidade e escopo

| Princípio | Status | Observação |
| --- | --- | --- |
| Mudanças cirúrgicas e sem escopo alheio | PASS | Diff limitado à spec, `index.html` e dois testes |
| Abstrações mínimas / estilo existente | PASS | Helpers pequenos e Node built-in |
| Integridade dos testes | PASS | +8 testes, sem skips |
| Testes mapeiam integralmente a spec | FAIL | Atributos de imagem, carregamento de tracking, fontes, scripts, CSS e UAT não têm cobertura suficiente |
| Outcome check ancorado na spec | FAIL | Lista exata de fontes não é definida pela spec; várias asserções checam apenas presença textual |
| Sem scope creep | PASS | Nenhum Service Worker, PurgeCSS, mudança hPanel ou `.htaccess` |
| Critério de conclusão atendido | FAIL | CSS não minificado; bytes não reduzidos de forma consistente; desktop não revalidado |
| Diretriz usada | PASS | `tlc-spec-driven/references/coding-principles.md`; não há guideline de testes específico desta feature no repositório |

## Gaps ranqueados e fix plans

1. **Major — teste não protege atributos de imagem** (`spec:25`; M2): criar comparação baseline-aware de cada `<img>` por `src`, `srcset`, `width`, `height` e `alt`; concluído quando remover/alterar qualquer atributo mata o gate.
2. **Major — CSS inline obrigatório não foi minificado** (`spec:34`): executar Lightning CSS sem remoção de seletores e registrar métrica antes/depois; concluído quando o diff contém a transformação e testes preservam conteúdo/estrutura.
3. **Major — tracking é validado por presença, não comportamento** (`spec:20-21`, `:31`, `:51`): validar atributos reais de `<script>` e executar o repasse de parâmetros em DOM controlado; concluído quando desativar o `src` ou o repasse mata o teste.
4. **Minor — ausência de validação independente desktop/runtime** (`spec:49-50`): repetir desktop e mobile, FAQ, CTAs e console, registrando viewport e resultado observável.
5. **Minor — contrato de fonte impreciso** (`spec:28`): documentar quais arquivos/pesos são necessários na primeira dobra ou substituir a lista derivada da implementação por evidência de uso.
6. **Minor — redução de bytes não demonstrada** (`spec:52`, `:67`): definir a métrica de transporte autoritativa e assegurar redução nela; raw aumentou 28 bytes e Brotli aumentou 9 bytes.

## Conclusão

**Overall**: **NOT READY / FAIL**  
**Gate**: 8/8  
**Sensor**: 1 morta, 1 sobrevivente, 1 não concluída  
**Principal bloqueio**: o mutante de texto alternativo sobrevive, portanto os testes não garantem a preservação de atributos exigida pela spec.
