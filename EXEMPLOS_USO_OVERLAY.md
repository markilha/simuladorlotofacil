# 💻 Exemplos de Uso - API do Sistema de Overlay

## Uso Básico

### Exemplo 1: Gerar Overlay Simples

```typescript
import { gerarOverlayVolante } from "./services/volanteOverlayService";

// Seus jogos (array de arrays de dezenas)
const jogos = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Jogo para quadro 1
  [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 5, 15, 25], // Jogo para quadro 2
  [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 2, 4], // Jogo para quadro 3
];

// Gerar overlay para os 3 quadros
gerarOverlayVolante(jogos, {
  quadrosAtivos: [1, 2, 3], // Preencher todos os 3 quadros
  formato: "pdf", // Exportar como PDF
});
```

### Exemplo 2: Gerar Overlay para Quadro Único

```typescript
const meuJogo = [[5, 6, 7, 10, 12, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25]];

gerarOverlayVolante(meuJogo, {
  quadrosAtivos: [1], // Apenas o primeiro quadro
  formato: "pdf",
});
```

### Exemplo 3: Overlay Personalizado

```typescript
const jogos = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
];

gerarOverlayVolante(jogos, {
  quadrosAtivos: [1, 2],
  formato: "pdf",

  // Personalizar marcações
  corMarcacao: "0,0,255", // Azul (R,G,B)
  espessuraMarcacao: 1.2, // Mais grossa
  tamanhoMarcacao: 0.8, // 80% da célula
});
```

### Exemplo 4: Exportar como PNG

```typescript
const jogos = [[1, 5, 10, 15, 20, 2, 7, 12, 17, 22, 3, 8, 13, 18, 23]];

gerarOverlayVolante(jogos, {
  quadrosAtivos: [1],
  formato: "png", // Exportar como PNG
  qualidadePng: 3, // Alta qualidade
});
```

---

## Configuração Personalizada

### Exemplo 5: Ajustar Calibração

```typescript
import { DEFAULT_VOLANTE_CONFIG } from "./services/volanteOverlayService";

const jogos = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]];

gerarOverlayVolante(jogos, {
  quadrosAtivos: [1],
  formato: "pdf",

  // Sobrescrever configuração padrão
  config: {
    ...DEFAULT_VOLANTE_CONFIG,
    margemEsquerdaMm: 12, // Ajustar margem esquerda
    margemTopoMm: 47, // Ajustar margem topo
    larguraCelulaMm: 14.5, // Células ligeiramente maiores
  },
});
```

### Exemplo 6: Calibração Fina para Impressora Específica

```typescript
// Configuração testada para impressora HP LaserJet
const configHpLaserJet = {
  margemEsquerdaMm: 9.5,
  margemTopoMm: 44,
  larguraCelulaMm: 14.2,
  alturaCelulaMm: 11.7,
  espacoHorizontalCelulasMm: 2.3,
  espacoVerticalCelulasMm: 1.4,
  alturaQuadroMm: 71.5,
  espacoEntreQuadrosMm: 3.2,
};

gerarOverlayVolante(jogos, {
  quadrosAtivos: [1, 2, 3],
  formato: "pdf",
  config: configHpLaserJet,
});
```

---

## Validação

### Exemplo 7: Validar Antes de Gerar

```typescript
import { validarJogosQuadros } from "./services/volanteOverlayService";

const jogos = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 1, 2, 3, 4, 5],
];
const quadrosAtivos = [1, 2, 3]; // Quer 3 quadros mas tem só 2 jogos

const validacao = validarJogosQuadros(jogos, quadrosAtivos);

if (!validacao.valido) {
  console.error(`Erro: ${validacao.erro}`);
  // Output: "Erro: Quadro 3 selecionado mas só há 2 jogo(s)"
} else {
  gerarOverlayVolante(jogos, { quadrosAtivos, formato: "pdf" });
}
```

### Exemplo 8: Validar Números

```typescript
const jogosInvalidos = [
  [1, 2, 3, 26, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // 26 é inválido!
];

const validacao = validarJogosQuadros(jogosInvalidos, [1]);

if (!validacao.valido) {
  console.error(validacao.erro);
  // Output: "Jogo 1 contém números inválidos: 26"
}
```

---

## Storage

### Exemplo 9: Salvar e Carregar Configurações

```typescript
import {
  saveVolanteConfig,
  loadVolanteConfig,
  saveOverlayOptions,
  loadOverlayOptions,
} from "./storage/volanteConfigStorage";

// Salvar configuração personalizada
saveVolanteConfig({
  margemEsquerdaMm: 11,
  margemTopoMm: 46,
});

// Salvar opções de overlay
saveOverlayOptions({
  corMarcacao: "255,0,0", // Vermelho
  espessuraMarcacao: 1.0,
  formato: "pdf",
});

// Carregar configurações salvas
const config = loadVolanteConfig();
const options = loadOverlayOptions();

console.log(config.margemEsquerdaMm); // 11
console.log(options.corMarcacao); // "255,0,0"
```

### Exemplo 10: Resetar Configurações

```typescript
import {
  resetVolanteConfig,
  resetOverlayOptions,
  DEFAULT_VOLANTE_CONFIG,
} from "./storage/volanteConfigStorage";

// Resetar para padrões
resetVolanteConfig();
resetOverlayOptions();

// Verificar
const config = loadVolanteConfig();
console.log(
  config.margemEsquerdaMm === DEFAULT_VOLANTE_CONFIG.margemEsquerdaMm
);
// true
```

---

## Casos de Uso Avançados

### Exemplo 11: Batch de Múltiplas Apostas

```typescript
import { gerarOverlayMultiplo } from "./services/volanteOverlayService";

const apostas = [
  {
    nome: "Aposta Pares",
    jogos: [
      [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 1, 3, 5],
      [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 7, 9, 11],
    ],
  },
  {
    nome: "Aposta Ímpares",
    jogos: [
      [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 2, 4],
      [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 6, 8],
    ],
  },
];

gerarOverlayMultiplo(apostas, {
  quadrosAtivos: [1, 2],
  formato: "pdf",
});
// Gera 2 PDFs (um por aposta) com delay de 100ms
```

### Exemplo 12: Integração com Componente React

```tsx
import { useState } from "react";
import { gerarOverlayVolante } from "../services/volanteOverlayService";
import type { Aposta } from "../types";

function MeuComponente({ aposta }: { aposta: Aposta }) {
  const [quadros, setQuadros] = useState<number[]>([1]);

  const handleGerar = () => {
    // Pegar até 3 jogos
    const jogos = aposta.jogos.slice(0, 3);

    gerarOverlayVolante(jogos, {
      quadrosAtivos: quadros,
      formato: "pdf",
      corMarcacao: "0,0,0",
      espessuraMarcacao: 0.8,
      tamanhoMarcacao: 0.65,
    });
  };

  const toggleQuadro = (q: number) => {
    setQuadros((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  };

  return (
    <div>
      {[1, 2, 3].map((q) => (
        <label key={q}>
          <input
            type="checkbox"
            checked={quadros.includes(q)}
            onChange={() => toggleQuadro(q)}
          />
          Quadro {q}
        </label>
      ))}
      <button onClick={handleGerar}>Gerar Overlay</button>
    </div>
  );
}
```

---

## Testes

### Exemplo 13: Teste Unitário - Validação

```typescript
import { describe, it, expect } from "vitest";
import { validarJogosQuadros } from "./services/volanteOverlayService";

describe("validarJogosQuadros", () => {
  it("deve validar jogos corretos", () => {
    const jogos = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]];
    const resultado = validarJogosQuadros(jogos, [1]);
    expect(resultado.valido).toBe(true);
  });

  it("deve rejeitar números inválidos", () => {
    const jogos = [[1, 2, 3, 26, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]];
    const resultado = validarJogosQuadros(jogos, [1]);
    expect(resultado.valido).toBe(false);
    expect(resultado.erro).toContain("inválidos");
  });

  it("deve rejeitar quadros sem jogo", () => {
    const jogos = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]];
    const resultado = validarJogosQuadros(jogos, [1, 2, 3]);
    expect(resultado.valido).toBe(false);
    expect(resultado.erro).toContain("Quadro 2");
  });
});
```

### Exemplo 14: Teste E2E - Geração Completa

```typescript
import { gerarOverlayVolante } from "./services/volanteOverlayService";

// Mock jsPDF
jest.mock("jspdf");

describe("gerarOverlayVolante E2E", () => {
  it("deve gerar PDF com configurações padrão", () => {
    const jogos = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]];

    expect(() => {
      gerarOverlayVolante(jogos, {
        quadrosAtivos: [1],
        formato: "pdf",
      });
    }).not.toThrow();
  });
});
```

---

## Integração com API Externa

### Exemplo 15: Gerar de API de Resultados

```typescript
async function gerarOverlayDoConcurso(numeroConcurso: number) {
  // Buscar resultado da API
  const response = await fetch(
    `https://api.loteria.com/lotofacil/${numeroConcurso}`
  );
  const data = await response.json();

  // Usar dezenas sorteadas como jogo
  const jogos = [data.dezenas];

  gerarOverlayVolante(jogos, {
    quadrosAtivos: [1],
    formato: "pdf",
  });
}

// Uso
gerarOverlayDoConcurso(3000);
```

---

## Performance

### Exemplo 16: Gerar Assincronamente

```typescript
async function gerarOverlayAsync(
  jogos: Dezena[][],
  options: OverlayOptions
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      gerarOverlayVolante(jogos, options);
      resolve();
    }, 0);
  });
}

// Uso
await gerarOverlayAsync(jogos, { quadrosAtivos: [1], formato: "pdf" });
console.log("Overlay gerado!");
```

---

## Referência Rápida de Tipos

```typescript
type Dezena = number; // 1-25

interface VolanteConfig {
  larguraPapelMm: number;
  alturaPapelMm: number;
  margemEsquerdaMm: number;
  margemTopoMm: number;
  larguraQuadroMm: number;
  alturaQuadroMm: number;
  espacoEntreQuadrosMm: number;
  numerosLinhas: number;
  numerosColunas: number;
  larguraCelulaMm: number;
  alturaCelulaMm: number;
  espacoHorizontalCelulasMm: number;
  espacoVerticalCelulasMm: number;
  offsetGridXMm: number;
  offsetGridYMm: number;
}

interface OverlayOptions {
  quadrosAtivos: number[];
  config?: Partial<VolanteConfig>;
  corMarcacao?: string;
  espessuraMarcacao?: number;
  tamanhoMarcacao?: number;
  formato?: "pdf" | "png";
  qualidadePng?: number;
}
```

---

**Pronto para começar! 🚀**
