# Otimização de desempenho da landing page

## Objetivo

Melhorar o carregamento móvel da landing page estática sem alterar conteúdo, aparência, CTAs, FAQ ou rastreamento. A implementação deve se limitar a mudanças necessárias, mensuráveis e de baixo risco no repositório.

## Evidências do baseline

- A página real respondeu HTTP 200 nas medições comuns.
- O handshake TLS medido ficou entre 63 ms e 353 ms e o TTFB entre 82 ms e 379 ms.
- A resposta HTTP 403 de aproximadamente 6 KB surgiu apenas após padrões de acesso automatizado e corresponde à proteção do WAF, não ao HTML da landing page.
- A produção carrega 25 imagens, 32 scripts, dois CTAs Hotmart e não apresentou erros de console no teste realizado.
- Imagens principais já usam WebP e a imagem de destaque já possui variante móvel.
- A minificação integral do CSS já foi avaliada no projeto e economizou apenas 1,8 KB transferidos, ganho insuficiente para justificar um diff massivo.

## Escopo da implementação

1. Criar verificações automatizadas para preservar:
   - textos e estrutura de conteúdo;
   - quantidade e destino dos CTAs Hotmart;
   - IDs e carregamento do Meta Pixel e Microsoft Clarity;
   - script da Utmify e repasse de parâmetros de atribuição ao checkout.
2. Otimizar a entrega de imagens:
   - manter logo e imagem principal com prioridade alta;
   - aplicar carregamento tardio somente às imagens abaixo da dobra que ainda carregam imediatamente;
   - preservar `srcset`, dimensões, textos alternativos e todas as imagens.
3. Otimizar fontes:
   - manter `font-display: swap`;
   - limitar preloads aos pesos Poppins 400 e 700 usados no primeiro viewport;
   - preservar famílias, pesos e aparência.
4. Otimizar scripts com segurança:
   - preservar integralmente os scripts de rastreamento e atribuição;
   - preservar a ordem atual: os scripts locais seguros já usam `defer`, enquanto `hooks` e `i18n` precisam executar antes das configurações inline dependentes;
   - não remover dependências do Elementor sem prova automatizada de que são desnecessárias.
5. Não minificar o CSS inline nesta etapa, pois o ganho medido de 1,8 KB não compensa o risco de alterar todo o bloco de estilos.
6. Não adicionar `.htaccess` enquanto a produção continuar entregando Brotli/Gzip pelo hCDN e cache público para arquivos estáticos. Regras duplicadas não melhoram a primeira visita e podem manter a oferta desatualizada.

## Fora do escopo

- Service Worker, pois não melhora a primeira visita e pode manter oferta ou tracking desatualizado.
- PurgeCSS ou remoção agressiva de CSS.
- Minificação integral do CSS inline.
- Reestruturação do HTML ou substituição do Elementor.
- Alteração de copy, imagens, CTAs ou eventos de tracking.
- Mudanças automáticas no hPanel da Hostinger.
- Regras de compressão e cache duplicadas no `.htaccess`.

## Validação

- Executar as verificações de conteúdo, CTA e tracking antes e depois das alterações.
- Abrir a página em viewport móvel e desktop e verificar a primeira dobra, imagens, FAQ e CTAs.
- Confirmar ausência de erros de console.
- Confirmar que os CTAs continuam recebendo UTMs e parâmetros do Meta quando presentes.
- Comparar quantidade de recursos prioritários e carregamento das imagens abaixo da dobra; atributos de lazy loading podem aumentar marginalmente o HTML bruto.
- Após a publicação, repetir medições em PageSpeed, Hostinger Page Speed e Chrome em rede móvel, distinguindo a página real de respostas 403 do WAF.

## Configuração manual da Hostinger

Após o deploy, o responsável deve:

1. Confirmar que o Hostinger CDN está ativo.
2. Manter o nível de segurança em `Medium` ou `Low` durante testes automatizados e não usar o modo `I'm Under Attack` sem um ataque real.
3. Manter compatibilidade com TLS 1.2 e TLS 1.3; restringir a TLS 1.3 não é necessário para esta otimização.
4. Limpar o cache do servidor e do CDN.
5. Executar o teste móvel em `Performance > Page Speed` no hPanel.

## Critério de conclusão

A mudança estará concluída quando o conteúdo e o tracking permanecerem equivalentes, as verificações passarem, a página funcionar em desktop e celular e o carregamento inicial executar menos trabalho crítico sem introduzir erros.
