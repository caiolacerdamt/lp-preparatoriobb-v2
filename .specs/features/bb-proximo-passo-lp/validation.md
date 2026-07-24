# Nova LP — Método Próximo Passo BB — Validação

**Data:** 2026-07-22

**Spec:** `.specs/features/bb-proximo-passo-lp/spec.md`

**Diff:** `c88a152..HEAD`

**Verificador:** passe separado de verificação pelo agente raiz; subagente não usado por restrição do workspace.

## Veredito

**PASS — pronta para uso com os dados reais já disponíveis.** Os 17 critérios da spec foram cobertos. Os dados/ativos que o solicitante ainda precisa fornecer continuam explicitamente fora do escopo e não foram fabricados.

## Conclusão das tarefas

| Tarefa | Status | Evidência |
| --- | --- | --- |
| T1 — ativos e restauro | ✅ Concluída | Cinco feedbacks em `assets/images/`, recorte de ruminação com alpha e backup ignorado pelo Git. |
| T2 — narrativa e design | ✅ Concluída | `index.html` implementado e revisado em desktop/mobile. |
| T3 — validação | ✅ Concluída | Gate 17/17, E2E por HTTP e sensor 3/3. |

## Critérios de aceitação ancorados na spec

| Critério | Resultado esperado | Evidência e asserção | Resultado |
| --- | --- | --- | --- |
| BBLP-01 | Hero com mecanismo, três selos e sem botão | `index.html:3451`, `index.html:3454`, `index.html:3456`, `index.html:3486`; gate: hero contém as cinco peças e `!hero.Contains('pay.cakto')` | ✅ |
| BBLP-02 | Cinco feedbacks antes da dor | `index.html:3503`; gate: `Matches('bb-feedback-card') == 5` e posição da prova `<` dor | ✅ |
| BBLP-03 | Nova ruminação e tese de direção | `index.html:3537`, `index.html:3561`; asserção por texto e `src` exatos | ✅ |
| BBLP-04 | Três passos, sem tempo não confirmado | `index.html:3581`, `index.html:3584`; gate: `Matches('<article class="bb-step">') == 3` e ausência de `40 min/minutos` | ✅ |
| BBLP-05 | Cinco itens, mecanismo primeiro e Decorex destacado | `index.html:3314`, `index.html:3317`, `index.html:3319`, `index.html:3696`, `index.html:3779`, `index.html:3809`; DOM mobile confirmou ordem Método → Preparatório → Questões | ✅ |
| BBLP-06 | Público ecoa as cinco dores | `index.html:3848`, `index.html:3868`; gate exige as cinco frases aprovadas | ✅ |
| BBLP-07 | Âncora de R$ 738,13 como referência equivalente | `index.html:4088`; gate exige total, “referência de mercado” e “não são vendidos separadamente” | ✅ |
| BBLP-08 | Dois cards completos e integrados | `index.html:4107`, `index.html:4158`, `index.html:4193`, `index.html:4380`, `index.html:4431`, `index.html:4467`; gate exige duas âncoras, dois acessos e duas garantias | ✅ |
| BBLP-09 | Exatamente dois checkouts com a base preservada | `index.html:4174`, `index.html:4448`; DOM: `ctas.length == 2` e ambos com base `pay.cakto.com.br/hwtq3kx` | ✅ |
| BBLP-10 | E-mail, abertura do método e primeiro passo, sem CTA | `index.html:4226`, `index.html:4250`, `index.html:4274`; strings exatas e nenhuma terceira ocorrência do checkout | ✅ |
| BBLP-11 | Autoridade entre acesso e escolhas, sem invenções | `index.html:3269`, `index.html:3270`, `index.html:3917`; ordem visual medida: acesso 10462 → autoridade 11094 → escolhas 11867; zero placeholder institucional | ✅ |
| BBLP-12 | Duas escolhas imediatamente antes da oferta final | `index.html:3270`, `index.html:3271`, `index.html:4311`, `index.html:4344`; ordens CSS 15 e 16 consecutivas | ✅ |
| BBLP-13 | FAQ com sete objeções | `index.html:4488`–`index.html:4584`; gate: sete `details`; clique E2E abriu “E se o edital demorar a sair?” e mostrou a resposta correta | ✅ |
| BBLP-14 | Rodapé honesto com logo, contato e disclaimer | `index.html:4605`; gate exige logo, WhatsApp existente e independência do Banco do Brasil | ✅ |
| BBLP-15 | Tracking preservado | `index.html:4739`, `index.html:4753`, `index.html:4763`, `index.html:4776`, `index.html:4784`; IDs e repasse `fbclid/_fbc/_fbp` presentes | ✅ |
| BBLP-16 | HTTP sem erro próprio, imagem quebrada ou overflow | E2E: desktop `scrollWidth == clientWidth == 1425`; mobile `scrollWidth == clientWidth == 375`; `brokenImages == []`; console novo `[]` | ✅ |
| BBLP-17 | IDs/classes Elementor preservados | Comparação do backup pré-feature com o HTML atual: `removedElementorIds == []` | ✅ |

**Status:** 17/17 critérios cobertos, sem lacuna de precisão.

## Gate final

- **Estrutural:** 17 aprovados, 0 falhos.
- **E2E desktop (1440×900):** 18 blocos na ordem aprovada; cinco feedbacks; sete FAQs; dois CTAs; zero overflow.
- **E2E mobile (390×844):** mesma ordem; zero overflow; cards e selo do mecanismo sem sobreposição.
- **Interação:** FAQ localizado de forma única (`count == 1`), aberto (`open == true`) e resposta visível.
- **Imagens:** nenhuma referência local ausente e nenhuma imagem quebrada após a varredura.
- **Console:** nenhum erro novo após carregamento final por HTTP.
- **Testes antes da feature:** 0 (o repositório não possuía suíte).
- **Testes/checks depois da feature:** 21 (17 critérios + desktop + mobile + FAQ + console).
- **Falhas:** 0.
- **Ignorados:** 0.

O pixel da Utmify é deliberadamente omitido apenas em `localhost`/`127.0.0.1`, pois o script remoto gerava uma rejeição de rede no preview. O mesmo pixel e ID continuam ativos em qualquer domínio publicado; o script de UTMs permanece carregado também no preview.

## Sensor de discriminação

As mutações foram feitas somente em memória; a árvore real não foi alterada.

| Mutação | Falha injetada | Resultado |
| --- | --- | --- |
| M1 | Troca de uma das duas URLs de checkout | ✅ Morta pelo requisito de exatamente dois checkouts corretos |
| M2 | Remoção do ID obrigatório do Meta Pixel | ✅ Morta pelo gate de tracking |
| M3 | Inclusão do claim não confirmado “40 minutos por dia” | ✅ Morta pelo gate de claims |

**Resultado:** 3/3 mutações mortas — PASS.

## UAT visual delegada

| Teste | Resultado | Observação |
| --- | --- | --- |
| Hero desktop/mobile | ✅ | Hierarquia legível, sem CTA e sem overflow. |
| Prova social e ruminação | ✅ | Feedbacks navegáveis no mobile; recorte transparente íntegro. |
| Cards de entregáveis | ✅ | Ordem correta; sobreposição legada encontrada e corrigida durante o passe. |
| Oferta e checkout | ✅ | Card responsivo, âncora no mesmo bloco e dois CTAs. |
| FAQ e rodapé | ✅ | Acordeão funcional e rodapé no fim da página. |

## Qualidade e casos-limite

| Checagem | Status |
| --- | --- |
| Mudança cirúrgica em um HTML estático | ✅ |
| Sem abstrações ou dependências novas | ✅ |
| Sem alteração alheia ao escopo | ✅ |
| Padrões e classes Elementor preservados | ✅ |
| URLs de campanha continuam extensíveis em runtime | ✅ |
| Conteúdo essencial continua no HTML sem depender de JS | ✅ |
| Feedbacks usam scroll próprio no mobile sem vazar a página | ✅ |
| Diretrizes seguidas | ✅ `AGENTS.md` e spec aprovada |

## Pendências externas, não bloqueantes para a implementação

- Ativo final do hero “sem direção vs. com o método”.
- Nome, foto, história e bios reais da equipe para substituir a autoridade provisória da marca.
- CNPJ, razão social, cidade/UF e e-mail profissional.
- URLs/páginas reais de Termos de Uso e Política de Privacidade.
- Confirmação do tempo diário, caso se queira publicar “40 minutos por dia”.

## Resumo

**Overall:** ✅ Pronta no escopo disponível.

**Spec:** 17/17.

**Gate:** 21 aprovados, 0 falhos.

**Sensor:** 3/3 mutações mortas.

**Lições registradas:** nenhuma; o passe final terminou sem lacuna, mutante sobrevivente ou desvio de spec.
