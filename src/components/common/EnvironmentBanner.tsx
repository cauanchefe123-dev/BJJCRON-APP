import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FlaskConical, ShieldCheck, RefreshCw, ArrowRight, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const EnvironmentBanner: React.FC = () => {
  const { environmentMode, setEnvironmentMode, resetHomologationData } = useData();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleReset = () => {
    resetHomologationData();
    setIsResetConfirmOpen(false);
  };

  if (environmentMode !== 'HOMOLOG') {
    return (
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            🟢 OPERAÇÃO REAL (PROD)
          </span>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Base oficial de alunos e finanças protegida contra testes.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Entender Regras de Proteção
          </button>

          <button
            onClick={() => setEnvironmentMode('HOMOLOG')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Entrar no Modo de Homologação / Testes
          </button>
        </div>

        {/* Modal Informativo das Regras de Homologação */}
        {isInfoModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl relative">
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">Proteção Extrema de Dados Reais</h3>
                  <p className="text-xs text-slate-400">Diretrizes do Sistema BJJCRON</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100">Preservação dos Dados da Academia:</strong>
                    <p className="text-slate-400">Os registros oficiais de alunos, chamadas e pagamentos reais nunca são redefinidos ou limpos por rotinas de teste.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FlaskConical className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100">Ambiente Isolado de Homologação:</strong>
                    <p className="text-slate-400">Todas as simulações e lançamentos de teste ocorrem exclusivamente no Modo de Homologação, sem impactar o banco oficial.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-purple-900/90 via-purple-950/90 to-indigo-950/90 border-b border-purple-800/60 px-3 py-2 text-xs text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-purple-500/20 border border-purple-400/40 rounded-lg text-purple-300 animate-pulse">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-purple-200 tracking-wide uppercase">
                🧪 AMBIENTE DE HOMOLOGAÇÃO & TESTES ATIVO
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Dados Isolados
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80">
              Todos os lançamentos nesta área são simulações. Nenhuma alteração afetará o banco real da academia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-[11px] font-medium transition-all cursor-pointer"
            title="Restaurar a base de testes inicial"
          >
            <RefreshCw className="w-3 h-3" />
            Resetar Testes
          </button>

          <button
            onClick={() => setEnvironmentMode('PROD')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] shadow-md transition-all cursor-pointer"
          >
            <span>Voltar p/ Operação Real</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal de Confirmação de Reset de Homologação */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Resetar Dados do Teste?</h3>
                <p className="text-xs text-slate-400">Restaurar a base de homologação para o estado inicial</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Esta ação irá restaurar os alunos e turmas fictícios do ambiente de testes para o padrão original. Os dados reais da academia continuarão 100% protegidos.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
              >
                Sim, Resetar Testes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
