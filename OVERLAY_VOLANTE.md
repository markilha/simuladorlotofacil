# Sistema de Overlay Transparente para Volante da Lotofácil

## 📋 Visão Geral

Este sistema permite gerar arquivos PDF ou PNG **transparentes** contendo apenas as marcações "X" posicionadas com precisão milimétrica sobre os números escolhidos do volante oficial da Lotofácil.

O arquivo gerado pode ser impresso diretamente sobre um volante em branco, eliminando a necessidade de preencher manualmente.

## 🎯 Objetivo

- **Não redesenhar** o volante oficial
- Criar apenas uma **camada transparente** com as marcações
- **Alinhamento perfeito** com o volante físico oficial
- **Calibração ajustável** para compensar variações de impressoras

## 🚀 Como Usar

### 1. Acesse a Página de Impressão

Navegue até **"Impressão de Volante"** no menu lateral.

### 2. Ative o Modo Overlay

Clique no botão **"Modo Overlay Transparente"** (em verde quando ativo).

### 3. Configure os Quadros

Selecione quais quadros do volante deseja preencher:

- ✅ **Quadro 1**: Primeiro jogo da sua aposta
- ✅ **Quadro 2**: Segundo jogo (se disponível)
- ✅ **Quadro 3**: Terceiro jogo (se disponível)

Cada quadro corresponde a um jogo salvo na aposta selecionada.

### 4. Escolha o Formato de Exportação

#### PDF (Vetorial) - **Recomendado**

- ✅ Qualidade perfeita em qualquer escala
- ✅ Arquivo menor
- ✅ Compatível com qualquer impressora
- 📄 Formato: `.pdf`

#### PNG (Imagem)

- ⚙️ Qualidade ajustável (Baixa/Média/Alta)
- 📦 Arquivo maior em alta qualidade
- 🖼️ Formato: `.png`

### 5. Ajuste as Opções de Marcação

| Opção               | Descrição                       | Valor Padrão    |
| ------------------- | ------------------------------- | --------------- |
| **Cor da marcação** | RGB formato "R,G,B"             | `0,0,0` (preto) |
| **Espessura**       | Espessura do traço em mm        | `0.8 mm`        |
| **Tamanho**         | Proporção da célula (0.1 a 1.0) | `0.65`          |

**Exemplo de cores:**

- Preto: `0,0,0`
- Azul escuro: `0,0,128`
- Vermelho: `255,0,0`

### 6. Gere o Overlay

Clique em **"Gerar Overlay Transparente"** e o arquivo será baixado automaticamente.

### 7. Imprima sobre o Volante

1. **Imprima** o arquivo gerado em papel comum ou transparência
2. **Posicione** cuidadosamente sobre o volante oficial em branco
3. **Verifique** se as marcações coincidem com as células dos números
4. Se necessário, ajuste a calibração e imprima novamente

---

## 🔧 Calibração Fina (Avançado)

Se as marcações não estiverem perfeitamente alinhadas com seu volante impresso, use a seção **"Calibração Fina"**.

### Medidas Principais

| Parâmetro                | Descrição                                     | Padrão    |
| ------------------------ | --------------------------------------------- | --------- |
| **Margem esquerda**      | Distância da borda esquerda do papel          | `10 mm`   |
| **Margem topo**          | Distância do topo do papel ao primeiro quadro | `45 mm`   |
| **Largura célula**       | Largura de cada número (01-25)                | `14 mm`   |
| **Altura célula**        | Altura de cada número                         | `11.5 mm` |
| **Espaço horizontal**    | Espaço entre colunas                          | `2.5 mm`  |
| **Espaço vertical**      | Espaço entre linhas                           | `1.5 mm`  |
| **Altura quadro**        | Altura total de cada quadro de jogo           | `72 mm`   |
| **Espaço entre quadros** | Distância vertical entre quadros 1→2→3        | `3 mm`    |

### Como Ajustar

1. **Imprima uma versão de teste** com as configurações padrão
2. **Compare** com o volante oficial:
   - Marcar um número no canto superior esquerdo (01)
   - Marcar um número no canto inferior direito (25)
3. **Meça as diferenças** com uma régua:

   - Se estiver deslocado para direita: **reduza** margem esquerda
   - Se estiver deslocado para baixo: **reduza** margem topo
   - Se as marcações estiverem comprimidas: **aumente** largura/altura da célula
   - Se as marcações estiverem espaçadas demais: **reduza** largura/altura da célula

4. **Ajuste incrementalmente** (0.5 mm por vez)
5. **Salve** as configurações para uso futuro

### Exemplo de Ajuste

Se você medir que:

- A marcação do número 01 está **2mm à direita** do esperado
- A marcação do número 25 está **1mm abaixo** do esperado

Ajuste:

- Margem esquerda: `10 mm` → `8 mm` (reduza 2mm)
- Margem topo: `45 mm` → `44 mm` (reduza 1mm)

---

## 📐 Estrutura do Volante

O volante oficial da Lotofácil possui:

- **3 quadros verticais** de jogo
- Cada quadro tem **25 números** organizados em grade **5×5**:
  ```
  [01] [06] [11] [16] [21]
  [02] [07] [12] [17] [22]
  [03] [08] [13] [18] [23]
  [04] [09] [14] [19] [24]
  [05] [10] [15] [20] [25]
  ```
- Papel A4 (210mm × 297mm)

---

## 💡 Dicas e Boas Práticas

### ✅ Recomendações

1. **Use PDF quando possível** - Melhor qualidade e compatibilidade
2. **Faça um teste em papel comum** antes de usar o volante oficial
3. **Salve suas configurações** após calibrar
4. **Imprima em 100%** de escala (sem ajuste de tamanho)
5. **Use impressora a laser** para melhor precisão

### ⚠️ Atenções

- Diferentes impressoras podem ter **variações milimétricas**
- Configure **margens zero** nas configurações de impressão
- Desative **"Ajustar ao papel"** ou **"Redimensionar"**
- Use **orientação retrato (Portrait)**

### 🎨 Personalização

- **Marcação preta** (`0,0,0`) é a mais legível
- **Espessura 0.8mm** imita uma caneta esferográfica
- **Tamanho 0.65** preenche bem sem ultrapassar a célula

---

## 🔄 Fluxo Completo de Uso

```
1. Criar/Selecionar aposta com jogos
         ↓
2. Ir para "Impressão de Volante"
         ↓
3. Ativar "Modo Overlay Transparente"
         ↓
4. Selecionar quadros (1, 2 e/ou 3)
         ↓
5. Configurar formato e marcações
         ↓
6. [Opcional] Ajustar calibração fina
         ↓
7. Gerar Overlay Transparente
         ↓
8. Imprimir arquivo gerado
         ↓
9. Posicionar sobre volante oficial
         ↓
10. Verificar alinhamento
         ↓
11. [Se necessário] Recalibrar e reimprimir
         ↓
12. ✅ Volante pronto para apostar!
```

---

## 📊 Comparação: Overlay vs Volante Completo

| Característica         | Overlay Transparente             | Volante Completo (Antigo)   |
| ---------------------- | -------------------------------- | --------------------------- |
| **Arquivo gerado**     | Apenas marcações X               | Volante inteiro redesenhado |
| **Uso**                | Imprimir sobre volante oficial   | Substituir volante oficial  |
| **Alinhamento**        | Calibrável ao milímetro          | Fixo                        |
| **Formato**            | PDF vetorial ou PNG              | PDF fixo                    |
| **Flexibilidade**      | Escolher quadros individualmente | Todos jogos em sequência    |
| **Tamanho arquivo**    | Muito pequeno                    | Maior                       |
| **Aceitação lotérica** | ✅ 100% oficial                  | ⚠️ Pode variar              |

---

## 🐛 Solução de Problemas

### Problema: Marcações desalinhadas

**Solução:** Use a calibração fina para ajustar margens e dimensões das células.

### Problema: Marcações muito grandes/pequenas

**Solução:** Ajuste o parâmetro "Tamanho marcação" (valor entre 0.1 e 1.0).

### Problema: Arquivo não abre

**Solução:** Certifique-se de ter um leitor PDF instalado (Adobe Reader, navegador moderno).

### Problema: Impressão não respeita dimensões

**Solução:**

- Configure impressora para **"Tamanho real"** ou **"100%"**
- Desative **"Ajustar à página"**
- Verifique orientação: **Retrato/Portrait**

### Problema: Quadro indisponível

**Solução:** A aposta selecionada tem menos jogos que quadros. Selecione apenas os quadros disponíveis.

---

## 💾 Armazenamento de Configurações

Suas configurações de calibração e preferências de overlay são **salvas automaticamente** no navegador (localStorage).

Para **resetar** todas as configurações, clique em **"Restaurar padrões"**.

---

## 📱 Suporte e Feedback

Se encontrar problemas ou tiver sugestões de melhoria, abra uma issue no repositório do projeto.

---

**Desenvolvido com ❤️ para facilitar suas apostas na Lotofácil!**
