# Atualização da oferta e dos feedbacks da landing page

## Objetivo

Atualizar a promessa principal, a prova social, a ancoragem de valor, o preço e as formas de pagamento da landing page do Método Próximo Passo BB, preservando a estrutura atual exportada do Elementor.

## Escopo

### Hero

Substituir o título principal visível por:

> Pare de esperar o edital pra começar. O Método Próximo Passo BB te diz o que estudar hoje, mesmo começando do zero.

O texto pode manter destaques de cor por meio de elementos internos, mas a frase exibida deve permanecer exatamente igual.

### Feedbacks

- Converter `feedback.jpeg` para `assets/images/feedback-novo.webp`, preservando as dimensões de 1206×1336 e limitando o arquivo final a 100 KB para manter a legibilidade com redução objetiva de peso.
- Acrescentar a nova imagem aos cinco feedbacks existentes, totalizando seis.
- Usar um layout masonry responsivo para acomodar imagens horizontais e verticais sem cortes: três colunas no desktop, duas no tablet e uma no celular.
- Preservar carregamento tardio, decodificação assíncrona, dimensões explícitas e texto alternativo descritivo.

### Ancoragem de valor

Na seção “Recapitulando tudo o que você recebe”, substituir os quatro valores visíveis por:

- Preparatório Completo Banco do Brasil: R$ 147,00.
- Mais de 2.000 questões comentadas Cesgranrio: R$ 60,00.
- Método Próximo Passo BB: R$ 40,00.
- Bônus Decorex: R$ 50,00.

Esses valores somam exatamente R$ 297,00. Atualizar também o texto de soma da seção para R$ 297,00.

### Oferta e pagamento

Nos dois blocos de oferta:

- Trocar o preço parcelado para 9x de R$ 5,23.
- Trocar o preço à vista para R$ 47,00.
- Trocar o valor de referência do CTA para R$ 297,00.
- Preservar botões, links de checkout, benefícios, garantia e estrutura visual existentes.

No FAQ “Quais são as formas de pagamento?”, exibir:

> Pix à vista por R$ 47,00 ou cartão em até 9x de R$ 5,23.

## Implementação

A mudança permanece concentrada em `index.html`, nos testes existentes e no novo ativo WebP. O layout masonry será implementado no CSS local já usado pela seção de prova social, com media queries compatíveis com os breakpoints atuais.

O JPEG fornecido na raiz é apenas a fonte da conversão e não deve ser referenciado pela página nem incluído como ativo final.

## Validação

- Executar os testes de integridade e desempenho existentes.
- Adicionar ou atualizar asserções para a nova hero, os valores da ancoragem, os dois preços dos CTAs, o Pix no FAQ e o sexto feedback WebP.
- Confirmar que nenhum valor antigo da oferta (`R$ 738,13`, `R$ 67,00` ou `R$ 7,45`) permanece visível.
- Confirmar que os seis feedbacks são renderizados e que o JPEG não é referenciado.
- Inspecionar a página em desktop, tablet e celular. O layout deve computar respectivamente 3, 2 e 1 colunas, não pode causar overflow horizontal e deve preservar a proporção integral das seis imagens, sem cortes.

## Fora de escopo

- Alterar o checkout da Hotmart.
- Mudar os textos de garantia ou os links dos CTAs.
- Remover feedbacks existentes.
- Refatorar o HTML exportado do Elementor além do necessário para estas alterações.
