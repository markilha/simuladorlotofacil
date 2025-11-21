import { useState } from "react";
import {
  DEFAULT_PDF_SETTINGS,
  savePdfSettings,
  loadPdfSettings,
} from "../storage/pdfSettingsStorage";
import { getAllBets } from "../storage/betsStorage";
import { gerarPdfApostas } from "../services/pdfService";
import type { Aposta } from "../types";

export default function ImpressaoVolantePage() {
  const [apostas] = useState<Aposta[]>(getAllBets());
  const [apostaSelecionadaId, setApostaSelecionadaId] = useState<string>("");
  const [pdfSettings, setPdfSettings] = useState<
    Required<import("../services/pdfService").PdfApostasOptions>
  >(() => loadPdfSettings());
  const [mensagem, setMensagem] = useState<string | null>(null);

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
          Ajuste os parâmetros de impressão e gere o volante oficial com a
          combinação salva.
        </p>
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
          aproximá-los. Recomendamos uma impressão de teste em papel comum antes
          de encaixar o volante na impressora.
        </p>
        <button
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg shadow"
          onClick={handleImprimir}
        >
          Imprimir Volante
        </button>
      </div>
    </section>
  );
}
