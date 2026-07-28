# Reorganização visual dos feedbacks

## Objetivo

Remover o primeiro feedback exibido na seção de prova social e reorganizar os cinco depoimentos restantes para eliminar os vazios do masonry atual, preservando integralmente a legibilidade das imagens.

## Decisão visual

### Desktop, acima de 1024 px

Usar uma grade bento de 12 colunas:

```text
┌────────────┬────────────┬────────────┐
│ feedback 2 │ feedback 5 │            │
├────────────┼────────────┤ novo       │
│ feedback 6 │ feedback 8 │ vertical   │
└────────────┴────────────┴────────────┘
```

Os quatro feedbacks horizontais ocupam uma grade 2×2 nos oito primeiros módulos. O feedback vertical sobre a evolução de 38% para 72% ocupa os quatro módulos da direita e atravessa as duas linhas, tornando-se o destaque visual da composição.

### Tablet, de 768 px a 1024 px

Os quatro feedbacks horizontais formam uma grade de duas colunas. O feedback vertical aparece abaixo, centralizado e com a largura de uma coluna.

### Celular, até 767 px

Os cinco feedbacks aparecem em uma única coluna, na ordem do HTML e em largura integral.

## Conteúdo e ativos

- Remover da página o card que referencia `assets/images/feedback1.webp`.
- Manter `feedback2.webp`, `feedback5.webp`, `feedback6.webp`, `feedback8.webp` e `feedback-novo.webp`.
- Não cortar, distorcer ou usar `object-fit: cover` em nenhuma imagem.
- Manter carregamento tardio, decodificação assíncrona, dimensões e textos alternativos.
- O arquivo `feedback1.webp` pode permanecer na pasta de ativos; apenas sua exibição será removida.

## Alternativas descartadas

- Manter o masonry: produz colunas com alturas muito diferentes e grandes vazios, como mostra a captura enviada.
- Usar cards uniformes: exigiria cortar imagens ou criar áreas vazias dentro dos cards por causa das proporções distintas.

## Validação

- Confirmar exatamente cinco cards e ausência de referência a `feedback1.webp` no HTML.
- Confirmar a grade bento no desktop, duas colunas no tablet e uma coluna no celular.
- Confirmar ausência de overflow horizontal e preservação das proporções das cinco imagens nos três breakpoints.
- Executar toda a suíte de testes existente e atualizar somente os contratos afetados pela remoção do card e pela mudança de layout.

## Fora de escopo

- Apagar o ativo `feedback1.webp` do repositório.
- Alterar textos, preços, CTAs ou outras seções da landing page.
- Editar o conteúdo visual dos feedbacks restantes.
