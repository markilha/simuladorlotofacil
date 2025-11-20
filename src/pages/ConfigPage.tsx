import { useEffect, useRef, useState } from 'react';
import { saveResultsSheet, clearResultsSheet, getResultsSheetInfo } from '../storage/resultsSheetStorage';
import { carregarResultadosExcelFromBuffer } from '../utils/resultadosExcel';

const PLANILHA_URL = 'https://loterias.caixa.gov.br/Resultados/lotofacil.xlsx';

export function ConfigPage() {
  const [info, setInfo] = useState<{ savedAt: string; filename?: string } | null>(null);
  const [resumo, setResumo] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refreshInfo = () => {
    setInfo(getResultsSheetInfo());
    setResumo(null);
  };

  useEffect(() => {
    refreshInfo();
  }, []);

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const concursos = carregarResultadosExcelFromBuffer(buffer);
      saveResultsSheet(buffer, file.name);
      setResumo(`${concursos.length} concursos carregados`);
      setMensagem({ tipo: 'sucesso', texto: `Planilha "${file.name}" salva.` });
      refreshInfo();
    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error instanceof Error ? error.message : 'Não foi possível processar o arquivo.',
      });
    } finally {
      event.target.value = '';
    }
  };

  const handleClear = () => {
    clearResultsSheet();
    setMensagem({ tipo: 'sucesso', texto: 'Planilha removida.' });
    setResumo(null);
    refreshInfo();
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Configurações</h2>
        <p className="text-sm text-slate-400">
          Faça o download da planilha oficial da Lotofácil, carregue-a aqui e compartilhe os dados com todas as abas do
          simulador.
        </p>
      </header>

      {mensagem && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            mensagem.tipo === 'sucesso' ? 'border-emerald-500 text-emerald-300' : 'border-rose-500 text-rose-200'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <div className="space-y-4 rounded-2xl bg-slate-900/70 p-4">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.open(PLANILHA_URL, '_blank')}
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
                Último arquivo: <span className="font-semibold text-white">{info.filename || 'lotofacil.xlsx'}</span>
              </p>
              <p>Carregado em: {new Date(info.savedAt).toLocaleString('pt-BR')}</p>
              {resumo && <p className="text-emerald-300">{resumo}</p>}
            </div>
          ) : (
            <p className="text-slate-400">Nenhuma planilha salva. Carregue um arquivo para liberar as comparações.</p>
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
    </section>
  );
}

export default ConfigPage;
