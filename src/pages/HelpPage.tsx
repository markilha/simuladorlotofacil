import { Link } from 'react-router-dom';

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Section = ({ title, children }: SectionProps) => (
  <section className="space-y-3 rounded-2xl bg-slate-900/60 p-4 shadow">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <div className="space-y-2 text-sm leading-relaxed text-slate-200">{children}</div>
  </section>
);

function HelpPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-wider text-emerald-400">Help</p>
        <h2 className="text-2xl font-bold text-white">Ajuda e Tutoriais</h2>
        <p className="text-base text-slate-300">
          Este guia explica como configurar o simulador, escolher estrategias, executar combinacoes e transformar os jogos
          em PDFs prontos para impressao. Mantenha esta aba aberta enquanto trabalha nas outras telas.
        </p>
      </header>

      <Section title="Preparacao rapida">
        <ol className="list-decimal space-y-2 pl-5 text-slate-200">
          <li>
            Carregue a planilha oficial em{' '}
            <Link to="/config" className="font-semibold text-emerald-400 hover:underline">
              Configuracoes
            </Link>
            . Ela alimenta o historico usado nas abas de estrategias e resultados.
          </li>
          <li>
            Salve pelo menos um jogo simples ou simulacao para validar se o armazenamento local esta funcionando. Use{' '}
            <Link to="/resultados" className="font-semibold text-emerald-400 hover:underline">
              Resultados
            </Link>{' '}
            para revisar os registros.
          </li>
          <li>Repita a importacao da planilha em cada navegador ou dispositivo, pois os dados ficam apenas no localStorage.</li>
        </ol>
      </Section>

      <Section title="Quando usar cada estrategia">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-white">Simulador com numeros fixos</span>: escolha de 5 a 10 dezenas
            preferidas, defina quantas dezenas por jogo (15 a 18) e deixe o sistema sugerir o volume de combinacoes para
            garantir pelo menos 11 acertos.
          </li>
          <li>
            <span className="font-semibold text-white">Laboratorio de estrategias</span>: oferece modos Fixas, Fechamento,
            Desdobramento inteligente, Balanceado e Frequencias. Cada modo aceita filtros estatisticos (pares, linhas,
            colunas, repeticao do ultimo resultado) para reduzir o universo de jogos.
          </li>
          <li>
            <span className="font-semibold text-white">Simulador simples</span>: ideal para montar palpites rapidos de 15 a
            18 dezenas antes de aplicar tecnicas mais elaboradas.
          </li>
        </ul>
      </Section>

      <Section title="Executando combinacoes passo a passo">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            Em{' '}
            <Link to="/fixos" className="font-semibold text-emerald-400 hover:underline">
              Simulador com numeros fixos
            </Link>
            , clique nas dezenas fixas. O contador informa limite minimo e maximo.
          </li>
          <li>
            Ajuste dezenas por jogo e quantidade total. Desligue o preenchimento automatico se quiser digitar um valor manual.
          </li>
          <li>
            Acione <span className="font-semibold text-white">Gerar combinacoes</span>. Revise o painel de jogos e, se
            estiver tudo ok, use <span className="font-semibold text-white">Salvar simulacao</span>.
          </li>
          <li>
            Para coberturas maiores, abra o{' '}
            <Link to="/estrategias" className="font-semibold text-emerald-400 hover:underline">
              Laboratorio
            </Link>{' '}
            e teste o modo <em>Fechamento garantido</em>: informe dezenas base, escolha a garantia (12, 13 ou 14) e limite a
            quantidade de jogos que aceita pagar.
          </li>
        </ol>
      </Section>

      <Section title="Gerando instrucoes em PDF">
        <p>
          Os botoes <strong>Gerar PDF</strong> e <strong>Baixar PDF</strong> estao presentes nas telas de Fixos e
          Estrategias. Eles criam um documento com capa, parametros usados e todas as combinacoes formatadas.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Monte ou carregue os jogos desejados.</li>
          <li>Clique em <strong>Gerar PDF</strong> para preparar o layout.</li>
          <li>Se alterar qualquer configuracao, gere novamente antes de baixar para garantir conteudo atualizado.</li>
          <li>
            Finalize com <strong>Baixar PDF</strong> para salvar o arquivo localmente e compartilhar ou imprimir quando quiser.
          </li>
        </ol>
      </Section>

      <Section title="Dicas finais">
        <ul className="list-disc space-y-2 pl-5">
          <li>Nomeie cada simulacao ou estrategia para identifica-la rapidamente na aba de resultados.</li>
          <li>Apague apostas antigas com o botao Apagar na lista de resultados para manter o armazenamento limpo.</li>
          <li>Atualize a planilha oficial com frequencia para que os filtros de frequencias continuem relevantes.</li>
          <li>Se o PDF ficar pesado, gere blocos menores de jogos e una os arquivos depois.</li>
        </ul>
      </Section>
    </div>
  );
}

export default HelpPage;
