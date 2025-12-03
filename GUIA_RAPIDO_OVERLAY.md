# 🎯 Guia Rápido: Overlay Transparente

## O que é?

Sistema que gera um arquivo transparente (PDF/PNG) contendo apenas as marcações "X" nos números escolhidos, para imprimir diretamente sobre o volante oficial da Lotofácil.

## ⚡ Início Rápido (3 passos)

### 1️⃣ Prepare sua Aposta
- Crie uma aposta com seus jogos favoritos
- Salve a aposta

### 2️⃣ Gere o Overlay
- Vá em **"Impressão de Volante"**
- Clique em **"Modo Overlay Transparente"**
- Selecione os quadros (1, 2 ou 3)
- Clique em **"Gerar Overlay Transparente"**

### 3️⃣ Imprima
- Abra o arquivo baixado
- Imprima em **tamanho real (100%)**
- Posicione sobre o volante oficial

✅ **Pronto!** Seus números estão marcados perfeitamente!

---

## 🎨 Configurações Básicas

### Formato
- **PDF**: Melhor qualidade, recomendado ✅
- **PNG**: Se precisar editar em programa de imagem

### Marcação
- **Cor**: `0,0,0` (preto padrão)
- **Espessura**: `0.8 mm` (simula caneta)
- **Tamanho**: `0.65` (65% da célula)

---

## 🔧 Calibração (se necessário)

Se as marcações não alinharem perfeitamente:

1. **Imprima um teste** com configurações padrão
2. **Compare** com o volante oficial
3. **Ajuste** na seção "Calibração Fina":
   - Deslocado horizontalmente? → Ajuste **margem esquerda**
   - Deslocado verticalmente? → Ajuste **margem topo**
   - Marcações comprimidas? → Aumente **tamanho célula**
   - Marcações espaçadas? → Reduza **tamanho célula**
4. **Salve** as configurações
5. **Reimprima**

**Ajuste incrementalmente:** Use passos de 0.5mm por vez.

---

## 💡 Dicas Importantes

✅ **FAÇA:**
- Imprima em **100% de escala**
- Use configuração **"Tamanho real"** na impressora
- Configure **margens zero**
- Faça **teste em papel comum** primeiro
- **Salve suas configurações** após calibrar

❌ **NÃO FAÇA:**
- Usar "Ajustar ao papel"
- Redimensionar o arquivo
- Mudar orientação (use Retrato/Portrait)
- Imprimir em escala diferente de 100%

---

## 📱 Estrutura do Volante

```
Quadro 1 (Jogo 1):  [01-25]
       ↓ 3mm
Quadro 2 (Jogo 2):  [01-25]
       ↓ 3mm
Quadro 3 (Jogo 3):  [01-25]
```

Cada quadro tem grade 5×5:
```
01  06  11  16  21
02  07  12  17  22
03  08  13  18  23
04  09  14  19  24
05  10  15  20  25
```

---

## 🎯 Exemplo Prático

**Aposta:** 3 jogos de 15 números cada

1. Selecione aposta
2. Marque: ☑️ Quadro 1 ☑️ Quadro 2 ☑️ Quadro 3
3. Gere overlay
4. Imprima
5. Posicione sobre volante em branco
6. **Confira os 3 jogos marcados!**

---

## 📖 Documentação Completa

Para detalhes avançados, calibração profunda e solução de problemas, consulte:
**[OVERLAY_VOLANTE.md](./OVERLAY_VOLANTE.md)**

---

## 🆚 Overlay vs Volante Completo

| Overlay Transparente | Volante Completo |
|---------------------|------------------|
| Apenas marcações X | Redesenha volante inteiro |
| Imprimir sobre oficial | Substituir volante |
| Calibrável | Fixo |
| 100% aceito | Pode ter restrições |

**Use Overlay Transparente** para garantia de aceitação nas lotéricas! ✅

---

**Desenvolvido para facilitar suas apostas! Boa sorte! 🍀**
