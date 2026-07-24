# Revisão visual — hero, ruminação e checkout

**Status:** aprovado pelo usuário em 22/07/2026.

## Escopo aprovado

- Substituir o recorte defeituoso da ruminação pela imagem original limpa, sem as faixas criadas pela máscara de alpha.
- Corrigir o contraste da nota e da consequência na ancoragem para texto escuro sobre o card branco.
- Restaurar os três benefícios anteriores da hero: “Último Edital”, “+2000 Questões” e “Menos de 1h por dia”, mantendo seus ícones anteriores.
- Restaurar os dois cards de checkout ao conteúdo e ao visual existentes antes da implementação do Método Próximo Passo BB.
- Gerar do zero uma imagem ultrarrealista em formato horizontal, inspirada apenas na composição do print de referência.

## Direção da nova imagem

A fotografia mostrará a mesma candidata em dois momentos: à esquerda, sobrecarregada em uma mesa desorganizada; à direita, tranquila diante de uma rotina de estudo organizada. A imagem não conterá textos, logotipos, selos nem setas. Esses elementos serão renderizados em HTML/CSS para manter nitidez, acessibilidade e responsividade.

## Validação

- Desktop em 1440×900 e mobile em 390×844.
- Zero overflow horizontal, imagem quebrada ou erro próprio de console.
- Exatamente dois links de checkout com a URL base preservada.
- Comparação visual dos checkouts e benefícios contra o estado anterior no Git.

## Resultado da implementação

**PASS — 22/07/2026.** Os quatro critérios acima foram verificados. A hero usa a nova fotografia ultrarrealista com sobreposições responsivas em HTML/CSS; a imagem de ruminação foi substituída pela fonte limpa; o contraste da ancoragem foi corrigido; e os benefícios e os dois checkouts foram restaurados ao estado anterior solicitado.
