# Nova LP — Método Próximo Passo BB

**Status:** Aprovada pelo solicitante com autorização explícita para autoaprovação da spec.

## Problema

A página atual já está rebrandada visualmente, mas ainda vende o produto genérico antes de apresentar o mecanismo, não possui prova social nem passo a passo e usa ancoragem, autoridade, oferta e FAQ incompletos. A nova versão precisa vender direção diária antes de volume de conteúdo, mantendo a estrutura estática Elementor, o checkout e todo o rastreamento.

## Objetivos

- Colocar o Método Próximo Passo BB como mecanismo principal sem renomear o produto.
- Implementar a sequência real de decisão: hero → prova social → dor → solução → processo → entregáveis → público → transição → ancoragem → oferta 1 → acesso → autoridade → escolhas → oferta 2 → FAQ → rodapé.
- Exibir somente claims fornecidos ou verificáveis.
- Entregar página responsiva, sem imagens quebradas, sem erro de console e com exatamente dois CTAs de checkout.

## Fora de escopo

| Item | Motivo |
| --- | --- |
| Trocar checkout ou preço final | O checkout `hwtq3kx`, R$ 87 e 12x de R$ 8,89 devem ser preservados. |
| Criar VSL, WhatsApp flutuante ou links sociais | Explicitamente proibidos pelo plano. |
| Inventar identidade do fundador, CNPJ, razão social, e-mail ou números de alunos | Dados reais não foram fornecidos. |
| Publicar “40 minutos por dia” | O próprio plano marca o tempo como pendente de confirmação. |
| Publicar a imagem final “sem direção vs. com o método” | O solicitante informou que enviará o ativo depois. |

## Decisões e suposições fechadas

| Tema | Decisão | Justificativa |
| --- | --- | --- |
| Hero visual pendente | Manter a personagem atual e reforçar o mecanismo com um cartão de “próximo passo” usando o mockup já existente. | Evita placeholder quebrado e antecipa a prova do mecanismo até o ativo final chegar. |
| Prova social | Usar os cinco arquivos `feedback*.webp` fornecidos, sem reescrever depoimentos. | Evidência real disponível. |
| Ruminação | Usar `ruminações-novas.png` com remoção local de fundo preservando pixels e texto. | A cena e os balões já contêm a copy aprovada. |
| Tempo diário | Usar “uma rotina que cabe no seu dia”, sem número. | Claim numérico não confirmado. |
| Ancoragem | Comparar com soluções equivalentes publicadas no mercado: R$ 430,92 curso, R$ 121,41 questões, R$ 59,89 plano e R$ 125,91 resumos; total R$ 738,13. Comunidade permanece bônus sem valor atribuído. | Referência verificável em 22/07/2026 no Direção Concursos; não atribui preço fictício aos próprios itens. |
| Autoridade | Contar a motivação da marca em terceira pessoa, mostrar o método em uso e apoiar com a garantia; não atribuir nome/currículo a uma pessoa. | Falta nome e bio reais. |
| Pagamento | Informar cartão em 12x e Pix à vista, processado no checkout Cakto. | Compatível com o link e preço existentes, sem alegar desconto. |
| Dados legais ausentes | Manter os canais já existentes e inserir disclaimer de independência; listar CNPJ/razão social/e-mail como pendência final, não como texto visível fictício. | Evita dados falsos. |

**Questões em aberto:** nenhuma para a implementação segura; dados ausentes viram pendências explícitas no relatório final.

## Histórias e critérios de aceitação

### P1 — Entender a diferença da oferta

Como candidato frio, quero entender em poucos segundos que o mecanismo define meu próximo estudo, para perceber a diferença em relação a um cursinho genérico.

- **BBLP-01:** QUANDO a página abrir, ENTÃO o hero DEVE apresentar pré-headline, headline com Método Próximo Passo BB, subheadline, três selos de valor/risco e nenhum botão.
- **BBLP-02:** QUANDO o usuário avançar, ENTÃO DEVE ver cinco feedbacks reais antes da seção de dor.
- **BBLP-03:** QUANDO chegar à dor e à transição, ENTÃO DEVE ver a nova imagem de ruminação e a tese “problema de direção”.
- **BBLP-04:** QUANDO chegar ao processo, ENTÃO DEVE ver três passos em ordem e nenhum tempo numérico não confirmado.

### P1 — Tangibilizar e comprar

Como candidato avaliando a oferta, quero ver o mecanismo, o preparatório, as questões e os bônus como itens distintos, para entender o valor antes do preço.

- **BBLP-05:** A vitrine DEVE conter cinco itens, com Método Próximo Passo BB em primeiro e com maior destaque visual; Decorex DEVE ser o bônus de maior destaque.
- **BBLP-06:** A seção de público DEVE ecoar as dores presentes na nova imagem.
- **BBLP-07:** A ancoragem DEVE totalizar R$ 738,13 e identificar que se trata de referência de soluções equivalentes, não de preço avulso da Passou Concursos.
- **BBLP-08:** Cada um dos dois cards de preço DEVE reunir âncora, 12x de R$ 8,89, R$ 87 à vista, acesso até a prova, garantia de sete dias, segurança, acesso imediato e um botão para o checkout limpo.
- **BBLP-09:** A página DEVE conter exatamente dois links de compra e ambos DEVEM usar `https://pay.cakto.com.br/hwtq3kx` como URL base, permitindo apenas parâmetros adicionados em runtime.

### P1 — Remover objeções

- **BBLP-10:** O passo a passo pós-compra DEVE explicar e-mail, abertura do método e primeiro próximo passo, sem botão adicional.
- **BBLP-11:** A autoridade DEVE aparecer depois do passo a passo e antes das escolhas, sem credencial, identidade ou número inventado.
- **BBLP-12:** A conversa de duas escolhas DEVE ficar imediatamente antes do segundo card.
- **BBLP-13:** O FAQ DEVE responder acesso, demora do edital, atualização, iniciante, pagamento, segurança e garantia.
- **BBLP-14:** O rodapé DEVE exibir logo, contato existente, política/termos quando disponíveis e disclaimer de independência; dados legais não fornecidos não devem ser fabricados.

### P1 — Integridade técnica

- **BBLP-15:** A página DEVE manter Meta Pixel `1346343306919239`, Utmify `6a5d19e50a2816c4cbc3bedd`, `latest.js`, Clarity `xq7vjj64xz` e o repasse de `fbclid/_fbc/_fbp`.
- **BBLP-16:** Em HTTP, a página DEVE carregar sem erro de console, sem imagem quebrada e sem overflow horizontal em 390 px e 1440 px.
- **BBLP-17:** Nenhuma classe Elementor existente DEVE ser renomeada ou removida.

## Casos-limite

- Imagem com lazyload: o `src` e qualquer fallback/noscript devem apontar para ativo existente.
- Parâmetros de campanha ausentes: a URL base do checkout continua limpa e os scripts atuais podem anexar parâmetros em runtime.
- JavaScript do Elementor indisponível: conteúdo essencial permanece legível; FAQ pode usar o acordeão existente.
- Resolução móvel: feedbacks podem rolar horizontalmente, mas a página inteira não pode criar overflow lateral.

## Dimensões implícitas

| Dimensão | Resolução |
| --- | --- |
| Input, auth, concorrência, estado, persistência, lifecycle | N/A: página estática sem formulário, conta ou armazenamento. |
| Falha externa | Checkout permanece link simples; nenhuma chamada nova é criada. |
| Observabilidade | Console, imagens, tracking e links são auditados por HTTP. |
| Repetição/idempotência | Edição preserva IDs/classes e a validação checa duplicação de CTAs/seções. |

## Rastreabilidade

| Requisitos | Tarefa | Estado |
| --- | --- | --- |
| BBLP-01–04 | T2 | ✅ Verificado |
| BBLP-05–14 | T2 | ✅ Verificado |
| BBLP-15–17 | T3 | ✅ Verificado |

## Critérios de sucesso

- Dois e somente dois CTAs de compra.
- Zero imagem quebrada e zero erro de console após carregamento.
- Todos os blocos aparecem na ordem aprovada em desktop e mobile.
- Nenhum placeholder entre colchetes, claim não comprovado ou referência à Planilha do Casal visível.
