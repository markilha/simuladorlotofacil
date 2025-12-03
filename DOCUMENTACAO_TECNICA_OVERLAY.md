# 🛠️ Documentação Técnica: Sistema de Overlay Transparente

## Arquitetura

### Arquivos Criados

```
src/
├── services/
│   └── volanteOverlayService.ts    # Lógica de geração do overlay
├── storage/
│   └── volanteConfigStorage.ts     # Persistência de configurações
└── pages/
    └── ImpressaoVolantePage.tsx    # Interface (modificada)
```

---

## 📦 Serviços

### `volanteOverlayService.ts`

Responsável pela geração do overlay transparente.

#### Principais Tipos

```typescript
interface VolanteConfig {
  // Dimensões do papel
  larguraPapelMm: number;
  alturaPapelMm: number;

  // Margens e posicionamento
  margemEsquerdaMm: number;
  margemTopoMm: number;

  // Dimensões dos quadros
  larguraQuadroMm: number;
  alturaQuadroMm: number;
  espacoEntreQuadrosMm: number;

  // Grade de números
  numerosLinhas: number; // 5
  numerosColunas: number; // 5

  // Células individuais
  larguraCelulaMm: number;
  alturaCelulaMm: number;
  espacoHorizontalCelulasMm: number;
  espacoVerticalCelulasMm: number;

  // Offset da grade no quadro
  offsetGridXMm: number;
  offsetGridYMm: number;
}

interface OverlayOptions {
  quadrosAtivos: number[]; // [1, 2, 3]
  config?: Partial<VolanteConfig>;

  // Estilo da marcação
  corMarcacao?: string; // "R,G,B"
  espessuraMarcacao?: number; // mm
  tamanhoMarcacao?: number; // 0-1 (proporção)

  // Exportação
  formato?: "pdf" | "png";
  qualidadePng?: number; // 1-3
}
```

#### Funções Principais

##### `gerarOverlayVolante(jogos: Dezena[][], options: OverlayOptions)`

Gera o PDF overlay com marcações X.

**Processo:**

1. Cria PDF A4 em branco
2. Para cada quadro ativo:
   - Calcula posição base do quadro
   - Para cada número do jogo:
     - Calcula posição exata da célula
     - Desenha "X" vetorial na posição

**Algoritmo de Posicionamento:**

```typescript
// Posição de uma célula específica
function calcularPosicaoCelula(numero: Dezena, config: VolanteConfig) {
  const index = numero - 1; // 01-25 → 0-24
  const linha = Math.floor(index / 5);
  const coluna = index % 5;

  const x =
    margemEsquerda +
    offsetGridX +
    coluna * (larguraCelula + espacoHorizontal) +
    larguraCelula / 2;

  const y =
    margemTopo +
    offsetGridY +
    linha * (alturaCelula + espacoVertical) +
    alturaCelula / 2;

  return { x, y };
}
```

**Desenho do X:**

```typescript
function desenharMarcacaoX(
  doc: jsPDF,
  x: number,
  y: number,
  tamanho: number,
  espessura: number,
  cor: { r: number; g: number; b: number }
) {
  doc.setDrawColor(cor.r, cor.g, cor.b);
  doc.setLineWidth(espessura);

  const offset = tamanho / 2;

  // Diagonal \
  doc.line(x - offset, y - offset, x + offset, y + offset);

  // Diagonal /
  doc.line(x - offset, y + offset, x + offset, y - offset);
}
```

##### `validarJogosQuadros(jogos, quadrosAtivos)`

Valida se os jogos e quadros são compatíveis.

**Validações:**

- Quadros selecionados existem (1-3)
- Há jogos suficientes para os quadros
- Números são válidos (1-25)

##### `gerarPngOverlay(doc, filename, qualidade)`

Converte PDF para PNG transparente usando canvas.

**Processo:**

1. Obtém data URI do PDF
2. Cria Image temporária
3. Renderiza em Canvas com escala baseada na qualidade
4. Exporta como PNG blob
5. Faz download

---

## 💾 Storage

### `volanteConfigStorage.ts`

Gerencia persistência das configurações no localStorage.

#### Funções

```typescript
// Configuração do volante
loadVolanteConfig(): VolanteConfig
saveVolanteConfig(config: Partial<VolanteConfig>): void
resetVolanteConfig(): void

// Opções de overlay
loadOverlayOptions(): Omit<OverlayOptions, "quadrosAtivos">
saveOverlayOptions(options: Partial<OverlayOptions>): void
resetOverlayOptions(): void
```

#### Chaves de Storage

- `lotofacil_volante_config_v1`: Configuração do volante
- `lotofacil_overlay_options_v1`: Opções de overlay

**Nota:** `quadrosAtivos` não é persistido pois varia por geração.

---

## 🎨 Interface

### `ImpressaoVolantePage.tsx`

Componente React com dois modos:

1. **Modo Volante Completo** (original)
2. **Modo Overlay Transparente** (novo)

#### Estados

```typescript
// Modo ativo
const [modoOverlay, setModoOverlay] = useState(false);

// Configurações de overlay
const [volanteConfig, setVolanteConfig] = useState<VolanteConfig>();
const [overlayOptions, setOverlayOptions] = useState<OverlayOptions>();
const [quadrosSelecionados, setQuadrosSelecionados] = useState<number[]>([1]);

// Estados originais (modo completo)
const [pdfSettings, setPdfSettings] = useState<PdfApostasOptions>();
```

#### Handlers Principais

```typescript
// Alternar modo
setModoOverlay(true/false)

// Toggle quadros
handleToggleQuadro(quadro: number)

// Ajustar config
handleVolanteConfigChange(field, value)
handleOverlayOptionChange(field, value)

// Salvar/Resetar
handleSaveVolanteConfig()
handleResetVolanteConfig()

// Gerar overlay
handleGerarOverlay()
```

---

## 🔧 Calibração

### Parâmetros de Calibração

Baseados em medições da imagem do volante oficial:

```typescript
const DEFAULT_VOLANTE_CONFIG: VolanteConfig = {
  larguraPapelMm: 210, // A4
  alturaPapelMm: 297, // A4

  margemEsquerdaMm: 10, // Margem esquerda
  margemTopoMm: 45, // Cabeçalho do volante

  larguraQuadroMm: 85, // Largura total do quadro
  alturaQuadroMm: 72, // Altura total do quadro
  espacoEntreQuadrosMm: 3, // Gap entre quadros

  numerosLinhas: 5,
  numerosColunas: 5,

  larguraCelulaMm: 14, // Cada célula de número
  alturaCelulaMm: 11.5,

  espacoHorizontalCelulasMm: 2.5, // Gap entre células
  espacoVerticalCelulasMm: 1.5,

  offsetGridXMm: 3, // Margem interna do quadro
  offsetGridYMm: 3,
};
```

### Processo de Calibração

1. **Usuário imprime teste** com padrões
2. **Compara** com volante oficial
3. **Mede diferenças** com régua
4. **Ajusta parâmetros** na interface
5. **Salva configurações** personalizadas
6. **Reimprimir até alinhamento perfeito**

**Tolerância recomendada:** ±0.5mm

---

## 🎯 Algoritmos

### Cálculo de Posição por Número

Dado um número N (1-25), calcular (x, y) na página:

```
Índice da grade: i = N - 1
Linha: row = floor(i / 5)
Coluna: col = i % 5

X = margemEsquerda
  + offsetGridX
  + col × (larguraCelula + espacoH)
  + larguraCelula/2

Y = margemTopo
  + offsetQuadro
  + offsetGridY
  + row × (alturaCelula + espacoV)
  + alturaCelula/2

Onde:
  offsetQuadro = (numeroQuadro - 1) × (alturaQuadro + espacoEntreQuadros)
```

### Exemplo Prático

**Número 17, Quadro 2:**

```
i = 17 - 1 = 16
row = 16 / 5 = 3
col = 16 % 5 = 1

X = 10 + 3 + 1×(14+2.5) + 7 = 36.5 mm
Y = 45 + 1×(72+3) + 3 + 3×(11.5+1.5) + 5.75 = 170.25 mm
```

---

## 📊 Fluxo de Dados

```
Usuário seleciona aposta
        ↓
Escolhe quadros [1,2,3]
        ↓
Configura opções (cor, formato, etc)
        ↓
[handleGerarOverlay]
        ↓
validarJogosQuadros(jogos, quadros)
        ↓
gerarOverlayVolante(jogos, options)
        ↓
Para cada quadro ativo:
  Para cada número do jogo:
    calcularPosicaoCelula(numero)
    desenharMarcacaoX(x, y)
        ↓
Exportar PDF ou PNG
        ↓
Download automático
```

---

## 🧪 Testes Recomendados

### Teste 1: Alinhamento de Cantos

- Marcar apenas números: 01, 05, 21, 25
- Verificar cantos da grade

### Teste 2: Linha Completa

- Marcar linha horizontal: 01, 06, 11, 16, 21
- Verificar espaçamento horizontal

### Teste 3: Coluna Completa

- Marcar coluna vertical: 01, 02, 03, 04, 05
- Verificar espaçamento vertical

### Teste 4: Múltiplos Quadros

- Gerar overlay com 3 quadros
- Verificar espaçamento entre quadros

### Teste 5: Calibração Extrema

- Ajustar margem para +5mm e -5mm
- Verificar comportamento

---

## 🔒 Considerações de Segurança

- ✅ Validação de entrada (números 1-25)
- ✅ Sanitização de números (Number.isFinite)
- ✅ Validação de quadros (1-3)
- ✅ Try-catch em parse JSON (localStorage)
- ✅ Fallback para valores padrão

---

## 🚀 Otimizações Futuras

### Possíveis Melhorias

1. **Auto-calibração via OCR**

   - Usuário tira foto do volante
   - Sistema detecta automaticamente as dimensões

2. **Templates de impressoras**

   - Preset para HP, Epson, Canon, etc.
   - Calibrações pré-testadas

3. **Preview em tempo real**

   - Sobrepor preview no navegador
   - Ajustar antes de gerar

4. **Exportar múltiplos volantes**

   - Gerar PDF com múltiplas páginas
   - Batch de apostas

5. **Suporte a outros jogos**
   - Mega-Sena
   - Quina
   - Lotomania

---

## 📚 Dependências

```json
{
  "jspdf": "^2.x.x", // Geração de PDF
  "react": "^18.x.x" // Framework UI
}
```

**Nota:** Não requer bibliotecas adicionais além das já existentes no projeto.

---

## 🐛 Debug

### Logs de Desenvolvimento

Adicionar na função `gerarOverlayVolante`:

```typescript
console.log("Config:", config);
console.log("Quadros:", quadrosAtivos);
jogos.forEach((jogo, i) => {
  console.log(`Quadro ${i + 1}:`, jogo);
});
```

### Visualizar Coordenadas

Modificar `desenharMarcacaoX` para adicionar círculos:

```typescript
// Após desenhar X
doc.circle(x, y, 0.5); // Ponto central
```

---

## 📖 Referências

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**Desenvolvido em:** Dezembro 2025  
**Versão:** 1.0.0  
**Licença:** MIT
