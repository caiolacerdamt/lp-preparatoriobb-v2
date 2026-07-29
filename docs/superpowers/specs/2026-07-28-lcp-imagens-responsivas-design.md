# Prioridade do LCP e imagens responsivas Retina

## Objetivo

Elevar e estabilizar a performance móvel da landing page, corrigindo a prioridade do recurso que realmente determina o Largest Contentful Paint e reduzindo o excesso de bytes das imagens novas, sem alterar layout, conteúdo, CTAs ou rastreamento.

## Evidências do baseline

- Três auditorias móveis na produção atual marcaram 72, 73 e 94 pontos. O LCP variou entre 2,9 s e 6,8 s, enquanto o desktop marcou 100 pontos com LCP de 0,8 s.
- O elemento LCP identificado no mobile e no desktop é o `header` cuja imagem de fundo é `assets/images/banner-fundo-hero.webp`.
- A página prioriza hoje a logo e o comparativo do hero, mas não declara prioridade explícita para o background que efetivamente se torna LCP.
- A página transfere a logo original de 1600 px para slots de no máximo 210 px no desktop, 125 px no mobile e 170 px no rodapé.
- O feedback destacado possui 1206 px de largura e é exibido normalmente entre cerca de 360 e 480 px.
- As demais imagens apontadas pelo Lighthouse no mobile já ficam próximas de duas vezes o slot exibido e devem ser preservadas nesta etapa para manter nitidez Retina.
- Os 19 testes existentes passam e protegem conteúdo, CTAs, Meta Pixel, Clarity, Utmify e atribuição no checkout.

## Abordagem escolhida

Será usada a abordagem conservadora: manter o background CSS e a estrutura atual do hero, corrigir somente a ordem e a prioridade dos recursos e adicionar variantes responsivas às duas imagens novas com desperdício acima do necessário para Retina.

Converter o background em um elemento `<picture>` foi descartado nesta etapa por aumentar o risco de diferenças de cobertura, posicionamento e sobreposição. Reprocessar agressivamente todas as imagens também foi descartado porque o objetivo aprovado é preservar nitidez máxima.

## Design da implementação

### LCP

1. Adicionar no `<head>`, antes dos demais preloads de imagem, um preload para `assets/images/banner-fundo-hero.webp` com `as="image"`, `type="image/webp"` e `fetchpriority="high"`.
2. Manter a logo e o comparativo imediatamente descobertos no HTML, sem `loading="lazy"`.
3. Remover `fetchpriority="high"` da logo e do comparativo para que apenas o recurso LCP receba a prioridade máxima.
4. Remover o preload de alta prioridade do comparativo. O `<img>` continuará no HTML inicial, com `srcset` e `sizes`, e será descoberto normalmente pelo preload scanner.
5. Não alterar o CSS, as dimensões ou a aparência do header.

### Logo responsiva

1. Preservar `logo-proximo-passo-nobg.webp` como fallback e fonte original.
2. Gerar variantes WebP com 250, 420 e 640 px de largura.
3. Adicionar `srcset` às quatro ocorrências da logo e informar `sizes` específico para cada contexto:
   - hero: `(max-width: 767px) 125px, (max-width: 1024px) 170px, (max-width: 1366px) 190px, 210px`;
   - cards da oferta: `(max-width: 767px) 220px, 260px`;
   - rodapé: `(max-width: 767px) 150px, 170px`.
4. Manter `width`, `height`, `alt`, lazy loading das instâncias abaixo da dobra e classes existentes.

### Feedback destacado responsivo

1. Preservar `feedback-novo.webp` de 1206 px como fallback e maior candidato.
2. Gerar variantes WebP com 480, 800 e 960 px de largura.
3. Adicionar `srcset` e `sizes` ao feedback destacado para cobrir:
   - largura total no mobile: `calc(100vw - 46px)`;
   - meia largura no tablet: `calc(50vw - 45px)`;
   - coluna destacada no desktop: `350px`.
4. Manter proporção, dimensões declaradas, `loading="lazy"`, `decoding="async"`, texto alternativo e comportamento do grid.

### Pipeline de imagens

O script `optimize-images.mjs` será atualizado para tornar as novas variantes reproduzíveis. Ele continuará lendo as fontes de alta qualidade, aplicará WebP com a configuração de qualidade já usada pelo projeto e não reencodará repetidamente uma imagem previamente comprimida.

### Tracking e comportamento

Meta Pixel, Microsoft Clarity, Utmify, repasse de `fbclid`, `_fbc`, `_fbp`, UTMs, `xcod` e `sck` não serão alterados. CTAs, FAQ, scripts Elementor, fontes, copy e CSS permanecem fora deste lote.

## Validação automatizada

Os testes deverão confirmar:

- existência de um único preload de alta prioridade para `banner-fundo-hero.webp`;
- ausência de prioridade alta na logo e no comparativo;
- logo e comparativo continuam eager e responsivos;
- variantes da logo e do feedback existem, são WebP válidos e não excedem os limites definidos;
- `srcset` e `sizes` correspondem aos arquivos gerados;
- todos os contratos atuais de conteúdo, CTAs e tracking continuam passando.

## Validação visual e de performance

- Verificar a primeira dobra, feedbacks, cards da oferta e rodapé em 390 px, 768 px, 1366 px e 1440 px.
- Confirmar ausência de imagens borradas, cortes, saltos de layout e erros de console.
- Rodar pelo menos três auditorias móveis antes e depois e comparar a mediana de LCP e Performance.
- Após o deploy, limpar o cache do CDN e repetir o PageSpeed móvel em produção.

## Fora do escopo

- Agendamento ou alteração do Clarity.
- Alteração de Meta Pixel, Utmify ou atribuição.
- Remoção de jQuery ou dependências Elementor.
- Reestruturação do hero ou conversão do background para `<picture>`.
- Compressão agressiva de todas as imagens.
- Mudanças de CSS, copy, CTAs, oferta ou layout.

## Critério de conclusão

A implementação estará concluída quando o background correto for o único recurso de imagem com prioridade máxima, as variantes Retina forem selecionáveis pelo navegador, os testes e validações visuais passarem e a página preservar integralmente tracking, atribuição, conteúdo e comportamento.
