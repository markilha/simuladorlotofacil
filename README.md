# Lotofácil Simulator

Aplicação web em React + TypeScript que auxilia no planejamento de jogos da Lotofácil. O simulador permite montar apostas simples, gerar combinações com dezenas fixas, desenhar estratégias avançadas, conferir resultados e analisar estatísticas a partir da planilha oficial da Caixa.

## Pré-requisitos

- Node.js 20 LTS ou superior
- npm (instalado junto com o Node)

## Instalação e scripts

```bash
npm install          # instala dependências
npm run dev          # inicia o servidor de desenvolvimento em http://localhost:5173
npm run build        # gera a versão de produção em dist/
npm run preview      # serve o build para conferência
npm run lint         # roda o ESLint
```

## Fluxo recomendado de uso

### 1. Configurar a planilha oficial

1. Baixe o arquivo atualizado `lotofacil.xlsx` no site da Caixa (atalho disponível na aba **Configurações**).
2. Clique em **Carregar planilha baixada** e selecione o arquivo. O simulador extrai todos os concursos e armazena o conteúdo no `localStorage`.  
   - As abas **Simulador com fixos**, **Laboratório de Estratégias** e **Resultados** dependem dessa planilha para liberar os recursos de histórico.
3. Sempre que quiser atualizar os dados, repita o processo ou clique em **Remover planilha** para limpar o cache.

### 2. Criar apostas

#### Simulador simples
- Selecione de 15 a 18 dezenas no grid principal.
- Use **Limpar seleção** para reiniciar a escolha.
- Clique em **Salvar jogo simples** para armazenar a aposta. Cada jogo fica salvo localmente (pode ser conferido depois em **Resultados**).

#### Simulador com números fixos
- Escolha de 5 a 10 dezenas fixas. O app sugere automaticamente a quantidade mínima de jogos para garantir 11 pontos usando as demais dezenas.
- Defina:
  - Quantidade de dezenas por jogo (15 a 18)
  - Quantidade total de jogos que deseja gerar (pode sobrescrever o valor sugerido)
  - Nome da simulação
- Clique em **Gerar combinações**. Quando estiver satisfeito:
  - **Salvar simulação** guarda todos os jogos no `localStorage`.
  - **Gerar PDF** cria uma prévia. Use **Baixar PDF** para salvar o arquivo.
  - **Analisar histórico** compara os jogos gerados com todos os concursos carregados na planilha, exibindo faixas de premiação e destaques.

#### Laboratório de Estratégias
- Escolha um modo:
  - **Fixas + variáveis**: define dezenas obrigatórias e variáveis para construir os jogos.
  - **Fechamento garantido**: cria combinações com garantia de 12/13/14 pontos dentro de um limite máximo de jogos.
  - **Desdobramento inteligente**: divide uma base maior em subconjuntos otimizados.
  - **Balanceado**: gera jogos equilibrando pares/ímpares, faixas e linhas.
  - **Frequências**: usa estatísticas da planilha para misturar dezenas mais sorteadas e atrasadas.
- Configure filtros estatísticos (pares, soma, linhas, colunas, repetição do último concurso etc.) para reduzir o espaço de busca.
- Gere os jogos, revise o resumo estatístico exibido à direita, e então use **Salvar estratégia** ou **Gerar PDF**, como no simulador com fixos.

### 3. Conferir resultados

1. Vá para a aba **Resultados**.
2. Informe as 15 dezenas sorteadas de uma destas maneiras:
   - digitando manualmente e clicando em **Aplicar números digitados**;
   - clicando diretamente no grid;
   - escolhendo um concurso na lista carregada da planilha oficial.
3. Carregue suas apostas salvas (botão **Recarregar** caso tenha criado algo recentemente).
4. Clique em **Conferir apostas** para ver:
   - tabela com cada jogo, quantidade de acertos e faixa (11 a 15);
   - filtros por faixa mínima (11+, 12, 13, 14, 15);
   - estatísticas agregadas por faixa.
5. Para remover apostas antigas, use o botão **Apagar** em cada cartão.

## Sobre o armazenamento

- Apostas e planilhas ficam apenas no `localStorage` do navegador. Nenhum dado é enviado a servidores externos.
- Para limpar tudo, remova os dados do site no seu navegador ou use os botões de exclusão na interface.

## Estrutura do projeto

- `src/pages`: telas principais (Simples, Fixos, Estratégias, Resultados, Configurações).
- `src/components`: grid de dezenas, cartões de aposta, tabelas e demais componentes reutilizáveis.
- `src/services`: regras de geração de estratégias, criação de PDFs e leitura da planilha.
- `src/storage`: abstrações de `localStorage` para apostas e planilhas.
- `src/utils`: utilitários de combinações, análise estatística e importação do Excel.

## Próximos passos sugeridos

- Adicione testes automatizados para as regras de geração em `src/services/strategyEngine`.
- Integre autenticação ou sincronização em nuvem caso precise compartilhar apostas entre dispositivos.
