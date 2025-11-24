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

      <Section title="Manual de Estratégias">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-emerald-400">1. Fixas + variáveis inteligentes</h4>
            <p>
              Ideal para quem tem números da sorte. Você escolhe um conjunto de dezenas fixas (que estarão em todos os jogos) 
              e o sistema completa os volantes com as demais dezenas variáveis de forma inteligente, garantindo uma boa 
              distribuição. Se não escolher variáveis, o sistema usa todas as restantes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-400">2. Fechamento garantido</h4>
            <p>
              Técnica matemática que visa garantir uma premiação mínima (11, 12, 13, 14 ou 15 pontos) caso as dezenas 
              sorteadas estejam dentro do seu conjunto de dezenas escolhidas. É uma forma econômica de cobrir um grande 
              universo de números.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-400">3. Desdobramento inteligente</h4>
            <p>
              Gera combinações a partir de um "universo base" de dezenas (ex: 20 dezenas). O sistema cria jogos tentando 
              cobrir o máximo de combinações possíveis dentro desse universo, respeitando os filtros estatísticos definidos.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-400">4. Jogos balanceados</h4>
            <p>
              Gera jogos aleatórios, mas estritamente dentro dos padrões estatísticos mais comuns da Lotofácil (ex: 7 a 9 
              ímpares, soma entre 180 e 220). Ótimo para quem quer fugir de combinações improváveis.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-400">5. Frequentes × atrasados</h4>
            <p>
              Utiliza o histórico oficial para selecionar dezenas. Você define uma proporção (ex: 70% frequentes, 30% 
              atrasadas) e o sistema monta jogos misturando os números que mais saem com aqueles que estão há mais tempo 
              sem sair. <strong>Requer planilha carregada.</strong>
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-400">6. Fechamento do ciclo das dezenas</h4>
            <p>
              Foca nas dezenas que ainda não saíram no ciclo atual (um ciclo se fecha quando todas as 25 dezenas foram 
              sorteadas pelo menos uma vez). Estatisticamente, as dezenas que faltam para fechar o ciclo têm alta 
              probabilidade de sair nos próximos concursos. <strong>Requer planilha carregada.</strong>
            </p>
          </div>
        </div>
      </Section>

      <Section title="Executando combinações no Laboratório">
        <ol className="list-decimal space-y-3 pl-5 text-slate-200">
          <li>
            Acesse o{' '}
            <Link to="/estrategias" className="font-semibold text-emerald-400 hover:underline">
              Laboratório de Estratégias
            </Link>.
          </li>
          <li>
            Escolha o <strong>Modo de Estratégia</strong> desejado no menu suspenso.
          </li>
          <li>
            Configure os parâmetros específicos (dezenas fixas, variáveis, garantia, etc) e os <strong>Filtros Estatísticos</strong> 
            (pares, ímpares, soma, moldura) para refinar seus jogos.
          </li>
          <li>
            Clique em <span className="font-semibold text-white">Gerar estratégia</span>. O sistema processará as combinações 
            e exibirá uma prévia com métricas detalhadas.
          </li>
          <li>
            Se satisfeito, clique em <span className="font-semibold text-white">Salvar estratégia</span> para guardar os 
            jogos no seu histórico e conferir depois.
          </li>
        </ol>
      </Section>

      <Section title="Gerando instruções em PDF">
        <p>
          Na tela de <strong>Impressão de Volantes</strong>, você pode gerar um PDF com seus jogos salvos.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-slate-200">
          <li>Vá até a página de Impressão.</li>
          <li>Selecione a aposta ou estratégia salva que deseja imprimir.</li>
          <li>Ajuste as configurações de margem se necessário.</li>
          <li>
            Clique em <strong>Gerar PDF</strong> para baixar o arquivo formatado para recorte e impressão em papel A4.
          </li>
        </ol>
      </Section>

      <Section title="Dicas finais">
        <ul className="list-disc space-y-2 pl-5 text-slate-200">
          <li>Nomeie cada simulação ou estratégia para identificá-la rapidamente na aba de resultados.</li>
          <li>Apague apostas antigas com o botão Apagar na lista de resultados para manter o armazenamento limpo.</li>
          <li>Atualize a planilha oficial com frequência para que os filtros de frequências e ciclos continuem relevantes.</li>
          <li>Utilize os filtros estatísticos com moderação para não restringir demais as possibilidades de jogo.</li>
        </ul>
      </Section>
    </div>
  );
}

export default HelpPage;
