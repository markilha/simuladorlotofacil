import { useState } from "react";
import {
  DEFAULT_PDF_SETTINGS,
  savePdfSettings,
  loadPdfSettings,
} from "../storage/pdfSettingsStorage";
import { getAllBets } from "../storage/betsStorage";
import { gerarPdfApostas } from "../services/pdfService";
import {
  gerarOverlayVolante,
  validarJogosQuadros,
  DEFAULT_VOLANTE_CONFIG,
  type VolanteConfig,
  type OverlayOptions,
} from "../services/volanteOverlayService";
import {
  loadVolanteConfig,
  saveVolanteConfig,
  resetVolanteConfig,
  loadOverlayOptions,
  saveOverlayOptions,
  resetOverlayOptions,
} from "../storage/volanteConfigStorage";
import type { Aposta } from "../types";

export default function ImpressaoVolantePage() {
  const [apostas] = useState<Aposta[]>(getAllBets());
  const [apostaSelecionadaId, setApostaSelecionadaId] = useState<string>("");
  const [pdfSettings, setPdfSettings] = useState<
    Required<import("../services/pdfService").PdfApostasOptions>
  >(() => loadPdfSettings());
  const [mensagem, setMensagem] = useState<string | null>(null);

  // Estados para overlay transparente
  const [modoOverlay, setModoOverlay] = useState(false);
  const [volanteConfig, setVolanteConfig] = useState<VolanteConfig>(() =>
    loadVolanteConfig()
  );
  const [overlayOptions, setOverlayOptions] = useState<
    Omit<OverlayOptions, "quadrosAtivos">
  >(() => loadOverlayOptions());
  const [quadrosSelecionados, setQuadrosSelecionados] = useState<number[]>([1]);

  const apostaSelecionada =
    apostas.find((a) => a.id === apostaSelecionadaId) || apostas[0] || null;

  const handlePdfSettingChange = (
    field: keyof typeof pdfSettings,
    value: number
  ) => {
    setPdfSettings((prev) => ({
      ...prev,
      [field]: Number.isFinite(value) ? value : prev[field],
    }));
  };

  const handleSavePdfSettings = (event: React.FormEvent) => {
    event.preventDefault();
    savePdfSettings(pdfSettings);
    setMensagem("Ajustes de impressão salvos.");
  };

  const handleResetPdfSettings = () => {
    setPdfSettings({ ...DEFAULT_PDF_SETTINGS });
    setMensagem("Ajustes restaurados para padrão.");
  };

  const handleImprimir = () => {
    if (apostaSelecionada && pdfSettings) {
      gerarPdfApostas(apostaSelecionada, pdfSettings);
    }
  };

  // Handlers para overlay
  const handleVolanteConfigChange = (
    field: keyof VolanteConfig,
    value: number
  ) => {
    setVolanteConfig((prev) => ({
      ...prev,
      [field]: Number.isFinite(value) ? value : prev[field],
    }));
  };

  const handleOverlayOptionChange = (
    field: keyof typeof overlayOptions,
    value: number | string
  ) => {
    setOverlayOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveVolanteConfig = () => {
    saveVolanteConfig(volanteConfig);
    saveOverlayOptions(overlayOptions);
    setMensagem("Configurações de overlay salvos com sucesso.");
  };

  const handleResetVolanteConfig = () => {
    resetVolanteConfig();
    resetOverlayOptions();
    setVolanteConfig(DEFAULT_VOLANTE_CONFIG);
    setOverlayOptions(loadOverlayOptions());
    setMensagem("Configurações restauradas para padrão.");
  };

  const handleToggleQuadro = (quadro: number) => {
    setQuadrosSelecionados((prev) =>
      prev.includes(quadro)
        ? prev.filter((q) => q !== quadro)
        : [...prev, quadro].sort()
    );
  };

  const handleGerarOverlay = () => {
    if (!apostaSelecionada) return;

    // Preparar todos os jogos para o overlay
    const jogosParaOverlay = apostaSelecionada.jogos;

    // Validar
    const validacao = validarJogosQuadros(
      jogosParaOverlay,
      quadrosSelecionados
    );
    if (!validacao.valido) {
      setMensagem(`Erro: ${validacao.erro}`);
      return;
    }

    // Gerar overlay (automático: divide em cartões de 3 jogos)
    gerarOverlayVolante(jogosParaOverlay, {
      ...overlayOptions,
      quadrosAtivos: quadrosSelecionados,
      config: volanteConfig,
    });

    const numCartoes = Math.ceil(jogosParaOverlay.length / 3);
    setMensagem(
      `Overlay PDF gerado com ${numCartoes} cartão${
        numCartoes > 1 ? "es" : ""
      } (${jogosParaOverlay.length} jogos)`
    );
  };

  if (!apostas.length) {
    return (
      <div className="p-8 text-center text-lg text-slate-400">
        Nenhuma combinação salva encontrada para impressão.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Impressão de Volante</h2>
        <p className="text-sm text-slate-400">
          {modoOverlay
            ? "Gere um overlay transparente (PDF/PNG) para imprimir diretamente sobre o volante oficial."
            : "Ajuste os parâmetros de impressão e gere o volante oficial com a combinação salva."}
        </p>

        {/* Toggle modo impressão */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setModoOverlay(false)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              !modoOverlay
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Modo Volante Completo
          </button>
          <button
            onClick={() => setModoOverlay(true)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              modoOverlay
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Modo Overlay Transparente
          </button>
        </div>

        <div className="space-y-2 mt-4">
          <label className="block text-sm font-semibold text-slate-200 mb-1">
            Selecione a aposta para imprimir:
          </label>
          <select
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none min-w-[220px]"
            value={apostaSelecionadaId || (apostas[0]?.id ?? "")}
            onChange={(e) => setApostaSelecionadaId(e.target.value)}
          >
            {apostas.map((aposta) => (
              <option key={aposta.id} value={aposta.id}>
                {aposta.nome} ·{" "}
                {new Date(aposta.dataCriacao).toLocaleString("pt-BR")} · Jogos:{" "}
                {aposta.jogos.length}
              </option>
            ))}
          </select>
        </div>
      </header>

      {mensagem && (
        <div className="rounded-lg border px-4 py-3 text-sm border-emerald-500 text-emerald-300">
          {mensagem}
        </div>
      )}

      {/* Modo Overlay Transparente */}
      {modoOverlay ? (
        <div className="space-y-4">
          {/* Seleção de quadros */}
          <div className="rounded-2xl bg-slate-900/70 p-4 shadow space-y-3">
            <h3 className="text-lg font-semibold text-slate-200">
              Quadros do Volante
            </h3>
            <p className="text-sm text-slate-400">
              Selecione quais quadros (1, 2 ou 3) deseja preencher. Cada quadro
              corresponde a um jogo da sua aposta.
            </p>
            <div className="flex gap-3">
              {[1, 2, 3].map((quadro) => (
                <label
                  key={quadro}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={quadrosSelecionados.includes(quadro)}
                    onChange={() => handleToggleQuadro(quadro)}
                    disabled={
                      apostaSelecionada &&
                      apostaSelecionada.jogos.length < quadro
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-slate-200">
                    Quadro {quadro}
                    {apostaSelecionada &&
                      apostaSelecionada.jogos.length < quadro &&
                      " (indisponível)"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Opções de exportação */}
          <div className="rounded-2xl bg-slate-900/70 p-4 shadow space-y-3">
            <h3 className="text-lg font-semibold text-slate-200">
              Opções de Marcação
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 font-semibold text-slate-200">
                Cor da marcação (RGB)
                <input
                  type="text"
                  placeholder="0,0,0"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={overlayOptions.corMarcacao}
                  onChange={(e) =>
                    handleOverlayOptionChange("corMarcacao", e.target.value)
                  }
                />
              </label>

              <label className="flex flex-col gap-1 font-semibold text-slate-200">
                Tamanho marcação (proporção)
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={overlayOptions.tamanhoMarcacao}
                  onChange={(e) =>
                    handleOverlayOptionChange(
                      "tamanhoMarcacao",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* Calibração fina do volante */}
          <div className="rounded-2xl bg-slate-900/70 p-4 shadow space-y-3">
            <h3 className="text-lg font-semibold text-slate-200">
              Calibração Fina (Avançado)
            </h3>
            <p className="text-sm text-slate-400">
              Ajuste fino para alinhar perfeitamente com seu volante impresso.
              Use valores padrão primeiro e ajuste apenas se necessário.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
                Largura do cartão (mm)
                <input
                  type="number"
                  step="1"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={volanteConfig.larguraPapelMm}
                  onChange={(e) =>
                    handleVolanteConfigChange(
                      "larguraPapelMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
                Altura do cartão (mm)
                <input
                  type="number"
                  step="1"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={volanteConfig.alturaPapelMm}
                  onChange={(e) =>
                    handleVolanteConfigChange(
                      "alturaPapelMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
                Margem esquerda (mm)
                <input
                  type="number"
                  step="0.5"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={volanteConfig.margemEsquerdaMm}
                  onChange={(e) =>
                    handleVolanteConfigChange(
                      "margemEsquerdaMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
                Margem topo (mm)
                <input
                  type="number"
                  step="0.5"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={volanteConfig.margemTopoMm}
                  onChange={(e) =>
                    handleVolanteConfigChange(
                      "margemTopoMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
                Largura célula (mm)
                <input
                  type="number"
                  step="0.1"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={volanteConfig.larguraCelulaMm}
                  onChange={(e) =>
                    handleVolanteConfigChange(
                      "larguraCelulaMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
                Altura célula (mm)
                <input
                  type="number"
                  step="0.1"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={volanteConfig.alturaCelulaMm}
                  onChange={(e) =>
                    handleVolanteConfigChange(
                      "alturaCelulaMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
                Espaço horizontal células (mm)
                <input
                  type="number"
                  step="0.1"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={volanteConfig.espacoHorizontalCelulasMm}
                  onChange={(e) =>
                    handleVolanteConfigChange(
                      "espacoHorizontalCelulasMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
                Espaço vertical células (mm)
                <input
                  type="number"
                  step="0.1"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={volanteConfig.espacoVerticalCelulasMm}
                  onChange={(e) =>
                    handleVolanteConfigChange(
                      "espacoVerticalCelulasMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
                Altura do quadro (mm)
                <input
                  type="number"
                  step="0.5"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={volanteConfig.alturaQuadroMm}
                  onChange={(e) =>
                    handleVolanteConfigChange(
                      "alturaQuadroMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
                Espaço entre quadros (mm)
                <input
                  type="number"
                  step="0.5"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={volanteConfig.espacoEntreQuadrosMm}
                  onChange={(e) =>
                    handleVolanteConfigChange(
                      "espacoEntreQuadrosMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                onClick={handleSaveVolanteConfig}
                className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600"
              >
                Salvar configurações
              </button>
              <button
                type="button"
                onClick={handleResetVolanteConfig}
                className="rounded-lg border border-slate-800 px-4 py-2 font-semibold text-slate-200 hover:border-slate-500"
              >
                Restaurar padrões
              </button>
            </div>
          </div>

          {/* Botão gerar overlay */}
          <div className="rounded-2xl bg-slate-900/70 p-4 shadow">
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg shadow w-full sm:w-auto"
              onClick={handleGerarOverlay}
              disabled={quadrosSelecionados.length === 0}
            >
              Gerar Overlay Transparente
            </button>
            {quadrosSelecionados.length === 0 && (
              <p className="text-sm text-amber-400 mt-2">
                Selecione pelo menos um quadro para gerar o overlay.
              </p>
            )}
            <div className="mt-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
              <h4 className="font-semibold text-slate-200 mb-2">
                Instruções de uso:
              </h4>
              <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                <li>Selecione os quadros que deseja preencher (1, 2 ou 3)</li>
                <li>
                  Ajuste as opções de exportação (formato, cor, espessura)
                </li>
                <li>Clique em "Gerar Overlay Transparente"</li>
                <li>
                  Imprima o arquivo gerado em papel transparente ou sulfite
                  comum
                </li>
                <li>
                  Posicione o papel impresso sobre o volante oficial da
                  Lotofácil
                </li>
                <li>
                  Se necessário, ajuste a calibração fina e gere novamente
                </li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        /* Modo Volante Completo (original) */
        <div className="space-y-4 rounded-2xl bg-slate-900/70 p-4 shadow">
          <form className="space-y-3 text-sm" onSubmit={handleSavePdfSettings}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 font-semibold text-slate-200">
                Largura do retângulo (mm)
                <input
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={pdfSettings.larguraRetanguloMm}
                  onChange={(e) =>
                    handlePdfSettingChange(
                      "larguraRetanguloMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
              <label className="flex flex-col gap-1 font-semibold text-slate-200">
                Altura do retângulo (mm)
                <input
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={pdfSettings.alturaRetanguloMm}
                  onChange={(e) =>
                    handlePdfSettingChange(
                      "alturaRetanguloMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
              <label className="flex flex-col gap-1 font-semibold text-slate-200">
                Margem esquerda (mm)
                <input
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={pdfSettings.ajusteMargemEsquerdaMm}
                  onChange={(e) =>
                    handlePdfSettingChange(
                      "ajusteMargemEsquerdaMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
              <label className="flex flex-col gap-1 font-semibold text-slate-200">
                Margem topo (mm)
                <input
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={pdfSettings.ajusteMargemTopoMm}
                  onChange={(e) =>
                    handlePdfSettingChange(
                      "ajusteMargemTopoMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
              <label className="flex flex-col gap-1 font-semibold text-slate-200">
                Espaço entre colunas (mm)
                <input
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={pdfSettings.ajusteEspacoColunasMm}
                  onChange={(e) =>
                    handlePdfSettingChange(
                      "ajusteEspacoColunasMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
              <label className="flex flex-col gap-1 font-semibold text-slate-200">
                Espaço entre linhas (mm)
                <input
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  value={pdfSettings.ajusteEspacoLinhasMm}
                  onChange={(e) =>
                    handlePdfSettingChange(
                      "ajusteEspacoLinhasMm",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 font-semibold text-slate-200">
              Espaço entre blocos de jogos (mm)
              <input
                type="number"
                step="0.5"
                inputMode="decimal"
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                value={pdfSettings.ajusteEntreCamposMm}
                onChange={(e) =>
                  handlePdfSettingChange(
                    "ajusteEntreCamposMm",
                    Number(e.target.value)
                  )
                }
              />
            </label>
            <div className="flex flex-wrap gap-3 mt-2">
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600"
              >
                Salvar ajustes
              </button>
              <button
                type="button"
                onClick={handleResetPdfSettings}
                className="rounded-lg border border-slate-800 px-4 py-2 font-semibold text-slate-200 hover:border-slate-500"
              >
                Restaurar padrões
              </button>
            </div>
          </form>
          <p className="mb-6 text-slate-400 text-xs mt-4">
            Use valores positivos para afastar elementos e negativos para
            aproximá-los. Recomendamos uma impressão de teste em papel comum
            antes de encaixar o volante na impressora.
          </p>
          <button
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg shadow"
            onClick={handleImprimir}
          >
            Imprimir Volante
          </button>
        </div>
      )}
    </section>
  );
}
