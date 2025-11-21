import { useEffect, useRef, useState } from "react";
import {
  saveResultsSheet,
  clearResultsSheet,
  getResultsSheetInfo,
} from "../storage/resultsSheetStorage";
import {
  DEFAULT_PDF_SETTINGS,
  loadPdfSettings,
  savePdfSettings,
} from "../storage/pdfSettingsStorage";
import { carregarResultadosExcelFromBuffer } from "../utils/resultadosExcel";
import pdfGuides from "../assets/pdf-guides.svg";
import type { PdfApostasOptions } from "../services/pdfService";

const PLANILHA_URL = "https://loterias.caixa.gov.br/Resultados/lotofacil.xlsx";

export function ConfigPage() {
  const [info, setInfo] = useState<{
    savedAt: string;
    filename?: string;
  } | null>(null);
  const [resumo, setResumo] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{
    tipo: "sucesso" | "erro";
    texto: string;
  } | null>(null);
  const [pdfSettings, setPdfSettings] = useState<Required<PdfApostasOptions>>(
    () => loadPdfSettings()
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refreshInfo = () => {
    setInfo(getResultsSheetInfo());
    setResumo(null);
  };

  const handlePdfSettingChange = (
    field: keyof Required<PdfApostasOptions>,
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
    setMensagem({ tipo: "sucesso", texto: "Ajustes de impressão salvos." });
  };

  const handleResetPdfSettings = () => {
    setPdfSettings({ ...DEFAULT_PDF_SETTINGS });
  };

  useEffect(() => {
    refreshInfo();
  }, []);

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const concursos = carregarResultadosExcelFromBuffer(buffer);
      saveResultsSheet(buffer, file.name);
      setResumo(`${concursos.length} concursos carregados`);
      setMensagem({ tipo: "sucesso", texto: `Planilha "${file.name}" salva.` });
      refreshInfo();
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Não foi possível processar o arquivo.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleClear = () => {
    clearResultsSheet();
    setMensagem({ tipo: "sucesso", texto: "Planilha removida." });
    setResumo(null);
    refreshInfo();
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Configurações</h2>
        <p className="text-sm text-slate-400">
          Faça o download da planilha oficial da Lotofácil, carregue-a aqui e
          compartilhe os dados com todas as abas do simulador.
        </p>
      </header>

      {mensagem && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            mensagem.tipo === "sucesso"
              ? "border-emerald-500 text-emerald-300"
              : "border-rose-500 text-rose-200"
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <div className="space-y-4 rounded-2xl bg-slate-900/70 p-4">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.open(PLANILHA_URL, "_blank")}
            className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600"
          >
            Baixar planilha oficial
          </button>
          <button
            type="button"
            onClick={handleSelectFile}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-600"
          >
            Carregar planilha baixada
          </button>
          {info && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
            >
              Remover planilha
            </button>
          )}
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm">
          {info ? (
            <div className="space-y-1 text-slate-300">
              <p>
                Último arquivo:{" "}
                <span className="font-semibold text-white">
                  {info.filename || "lotofacil.xlsx"}
                </span>
              </p>
              <p>
                Carregado em: {new Date(info.savedAt).toLocaleString("pt-BR")}
              </p>
              {resumo && <p className="text-emerald-300">{resumo}</p>}
            </div>
          ) : (
            <p className="text-slate-400">
              Nenhuma planilha salva. Carregue um arquivo para liberar as
              comparações.
            </p>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFileChange}
      />

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-white">
            Ajustes dos cartões impressos
          </h3>
          <p className="text-sm text-slate-400">
            Defina os valores padrão para margens e espaçamentos em milímetros.
            Esses valores serão carregados em todos os simuladores, podendo ser
            ajustados rapidamente caso precise de um pequeno deslocamento.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
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
                  onChange={(event) =>
                    handlePdfSettingChange(
                      "larguraRetanguloMm",
                      Number(event.target.value)
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
                  onChange={(event) =>
                    handlePdfSettingChange(
                      "alturaRetanguloMm",
                      Number(event.target.value)
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
                  onChange={(event) =>
                    handlePdfSettingChange(
                      "ajusteMargemEsquerdaMm",
                      Number(event.target.value)
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
                  onChange={(event) =>
                    handlePdfSettingChange(
                      "ajusteMargemTopoMm",
                      Number(event.target.value)
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
                  onChange={(event) =>
                    handlePdfSettingChange(
                      "ajusteEspacoColunasMm",
                      Number(event.target.value)
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
                  onChange={(event) =>
                    handlePdfSettingChange(
                      "ajusteEspacoLinhasMm",
                      Number(event.target.value)
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
                onChange={(event) =>
                  handlePdfSettingChange(
                    "ajusteEntreCamposMm",
                    Number(event.target.value)
                  )
                }
              />
            </label>

            <p className="text-xs text-slate-400">
              Use valores positivos para afastar elementos e negativos para
              aproximá-los. Recomendamos uma impressão de teste em papel comum
              antes de encaixar o volante na impressora.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-600"
              >
                Salvar ajustes
              </button>
              <button
                type="button"
                onClick={handleResetPdfSettings}
                className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:border-slate-500"
              >
                Restaurar padrões
              </button>
            </div>
          </form>

          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
            <p className="font-semibold text-white">Visualize os ajustes</p>
            <img
              src={pdfGuides}
              alt="Guia com os pontos de margem e espaçamento do cartão da Lotofácil"
            />
            <p className="text-slate-400">
              Margens deslocam todo o cartão dentro da página. Espaços
              horizontais/verticais alinham os quadrados com as marcações do
              volante e o espaço entre blocos determina a distância entre cada
              conjunto de jogos.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}

export default ConfigPage;
