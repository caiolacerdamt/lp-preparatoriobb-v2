# Nova LP — Tarefas

**Design:** `.specs/features/bb-proximo-passo-lp/design.md`  
**Status:** ✅ Concluído e validado

## Test Coverage Matrix

> Gerada a partir de `AGENTS.md`; o repositório não possui testes. Para esta página estática, os critérios são cobertos por inspeção estrutural e E2E real via HTTP.

| Camada | Teste | Cobertura | Local | Comando |
| --- | --- | --- | --- | --- |
| Ativos estáticos | integração | Todos os `src` resolvem e imagens têm dimensões válidas | navegador local | inspeção por HTTP |
| DOM/copy/links | integração | 1:1 com BBLP-01–15 e placeholders proibidos | `index.html` | `rg` + avaliação DOM |
| Layout/interação | e2e | Desktop 1440×900 e mobile 390×844; console, FAQ e overflow | navegador local | Browser sobre `http://localhost:8123` |

## Parallelism Assessment

| Tipo | Paralelo? | Evidência |
| --- | --- | --- |
| Integração/E2E local | Não | Todos validam o mesmo `index.html` e servidor na porta 8123. |

## Gate Check Commands

| Gate | Uso | Comando |
| --- | --- | --- |
| Quick | Após ativos/copy | `rg` dirigido e metadados via Sharp |
| Full | Após HTML | inspeção DOM + console + imagens por HTTP |
| Build | Final | Full em 1440 px e 390 px, FAQ e links |

## Plano de execução

```text
Fase 1: T1
Fase 2: T1 → T2
Fase 3: T2 → T3
```

## T1 — Preparar ativos e ponto de restauro

**Status:** ✅ Concluída

**Onde:** `_backups/` e `assets/images/`  
**Depende de:** nada  
**Requisitos:** BBLP-02, BBLP-03

- Copiar os cinco feedbacks fornecidos para `assets/images/`.
- Criar versão do ativo de ruminação com alpha, sem redesenhar pessoa/balões/texto.
- Salvar backup do HTML atual.
- Gate Quick: todos os ativos existem, abrem e têm dimensões válidas.

**Testes:** integração  
**Commit:** `feat(lp): prepara ativos da nova narrativa`

## T2 — Implementar a narrativa e o design em `index.html`

**Status:** ✅ Concluída

**Onde:** `index.html`  
**Depende de:** T1  
**Requisitos:** BBLP-01–14, BBLP-17

- Atualizar e criar os blocos na ordem, copy e hierarquia aprovadas.
- Preservar classes/IDs Elementor, scripts, tracking e URL base de checkout.
- Gate Full: critérios DOM, imagens, console e layout passam.

**Testes:** integração + E2E co-localizados na tarefa  
**Commit:** `feat(lp): implementa Método Próximo Passo BB`

## T3 — Verificação independente e correções finais

**Status:** ✅ Concluída — 17/17 critérios e sensor 3/3

**Onde:** `.specs/features/bb-proximo-passo-lp/validation.md`  
**Depende de:** T2  
**Requisitos:** BBLP-01–17

- Re-derivar cada critério da spec, validar desktop/mobile, FAQ, checkout, tracking, imagens e claims.
- Executar sensor de discriminação por buscas negativas (placeholder, CTA extra, tracking ausente, texto legado).
- Registrar PASS/FAIL com evidências e corrigir qualquer falha antes de fechar.

**Testes:** integração + E2E  
**Commit:** `test(lp): valida nova página por spec`

## Checagens pré-execução

| Tarefa | Escopo | Status |
| --- | --- | --- |
| T1 | Um pacote coeso de ativos | ✅ |
| T2 | Um arquivo de página | ✅ |
| T3 | Um relatório de validação | ✅ |

| Tarefa | Depende de | Diagrama | Status |
| --- | --- | --- | --- |
| T1 | nada | início | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |

| Tarefa | Camada | Matriz exige | Tarefa prevê | Status |
| --- | --- | --- | --- | --- |
| T1 | ativos | integração | integração | ✅ |
| T2 | DOM/layout | integração + E2E | integração + E2E | ✅ |
| T3 | validação | integração + E2E | integração + E2E | ✅ |
