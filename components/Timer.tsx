"use client";

import { usePresetSelecionado } from "@/hooks/usePresets";
import { useSessao } from "@/hooks/useSessao";
import { presetPadrao, type ParametrosPreset } from "@/lib/preset";
import { duracaoFase, tempoRestante, type Fase } from "@/lib/sessao";
import BotaoConfirmacao from "./BotaoConfirmacao";
import { BotaoPainel } from "./PaineisContexto";

const RAIO = 126;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

const fases: Fase[] = ["foco", "pausaCurta", "pausaLonga"];

const nomes: Record<Fase, string> = {
  foco: "Foco",
  pausaCurta: "Pausa Curta",
  pausaLonga: "Pausa Longa",
};

const cores: Record<Fase, { texto: string; borda: string; anel: string }> = {
  foco: { texto: "text-primary", borda: "border-primary/20", anel: "stroke-primary-container" },
  pausaCurta: { texto: "text-secondary", borda: "border-secondary/20", anel: "stroke-secondary" },
  pausaLonga: { texto: "text-tertiary", borda: "border-tertiary/20", anel: "stroke-tertiary" },
};

const botaoIcone =
  "flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-on-surface-variant transition-colors hover:border-outline-variant hover:bg-surface-container hover:text-on-surface disabled:pointer-events-none disabled:opacity-40";

function formatar(ms: number){
  const segundos = Math.ceil(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  return `${String(minutos).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;
}

export default function Timer(){
  const { sessao, agora, iniciar, pausar, retomar, pularFase, reiniciarCiclos, encerrar } = useSessao();
  const selecionado = usePresetSelecionado();

  const ativa = sessao !== null && sessao.status !== "concluida";
  const preset: ParametrosPreset = ativa ? sessao.snapshotPreset : (selecionado ?? presetPadrao);
  const semPreset = !ativa && selecionado === null;
  const fase = ativa ? sessao.faseAtual : "foco";
  const duracao = duracaoFase(preset, fase);
  const restante = ativa ? tempoRestante(sessao, agora) : duracao;
  const ciclo = ativa ? sessao.cicloAtual : 1;
  const totalCiclos = preset.ciclosAntesPausaLonga;

  let rotulo = preset.nome;
  if(ativa) rotulo = `${nomes[fase]} • ${preset.nome}`;
  else if(sessao?.status === "concluida") rotulo = "Sessão concluída";
  else if(semPreset) rotulo = "Nenhum preset";

  function alternar(){
    if(!ativa){
      if(selecionado) iniciar(selecionado);
    } else if(sessao.status === "emAndamento") pausar();
    else retomar();
  }

  const posicaoAtual = `Você está no ciclo ${ciclo} de ${totalCiclos} (${nomes[fase]}).`;

  return (
    <section id="temporizador" className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center px-6 py-10 max-sm:px-4">
      <div className="inline-flex rounded-full border border-outline-variant/70 bg-surface-container-lowest p-1 shadow-inner">
        {fases.map((item) => {
          const atual = ativa && item === fase;
          const minutos = duracaoFase(preset, item) / 60_000;

          return (
            <span
              key={item}
              className={`rounded-full border px-5 py-1.5 text-xs font-medium tracking-wide whitespace-nowrap transition-all max-sm:px-3 ${
                atual
                  ? `bg-surface-container-high shadow-sm ${cores[item].texto} ${cores[item].borda}`
                  : "border-transparent text-on-surface-variant"
              }`}
            >
              {nomes[item]}
              <span className="max-sm:hidden"> ({minutos}m)</span>
            </span>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-8">
        <div className="relative flex size-88 items-center justify-center max-sm:size-60">
          <svg viewBox="0 0 280 280" className="size-full -rotate-90 drop-shadow-[0_0_12px_rgba(52,211,153,0.15)]">
            <circle cx="140" cy="140" r={RAIO} fill="none" strokeWidth="4" className="stroke-surface-variant" />
            <circle
              cx="140"
              cy="140"
              r={RAIO}
              fill="none"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={CIRCUNFERENCIA * (1 - restante / duracao)}
              className={`${cores[fase].anel} transition-[stroke-dashoffset] duration-1000 ease-linear`}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`mb-1 max-w-[70%] font-mono text-[11px] font-medium tracking-widest text-balance uppercase max-sm:text-[10px] max-sm:tracking-normal ${cores[fase].texto}`}>
              {rotulo}
            </span>
            <span className="text-8xl font-light tracking-tight tabular-nums text-on-surface max-sm:text-[3.5rem]">
              {formatar(restante)}
            </span>

            <div className="mt-4 flex flex-col items-center gap-1.5 max-sm:mt-3">
              <span className="text-xs font-medium text-on-surface-variant">
                Ciclo {ciclo} de {totalCiclos}
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalCiclos }, (_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i < ciclo && ativa ? "bg-primary shadow-[0_0_6px_rgba(90,240,179,0.7)]" : "bg-surface-container-highest"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 max-sm:gap-2">
          <BotaoConfirmacao
            titulo="Reiniciar ciclos?"
            mensagem={`${posicaoAtual} A sessão volta para o foco do ciclo 1, com o tempo cheio. A contagem de ciclos e o tempo já corrido da fase atual serão perdidos.`}
            rotuloConfirmar="Reiniciar ciclos"
            rotuloCancelar="Manter progresso"
            onConfirmar={reiniciarCiclos}
            title="Reiniciar ciclos"
            rotuloAcessivel="Reiniciar ciclos"
            disabled={!ativa}
            className={botaoIcone}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
              <path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6 0 2.97-2.17 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93 0-4.42-3.58-8-8-8zm-6 8c0-1.65.67-3.15 1.76-4.24L6.34 7.34C4.9 8.79 4 10.79 4 13c0 4.08 3.05 7.44 7 7.93v-2.02c-2.83-.48-5-2.94-5-5.91z" />
            </svg>
          </BotaoConfirmacao>

          <button
            type="button"
            onClick={alternar}
            disabled={semPreset}
            className="flex h-12 items-center gap-2 rounded-full bg-primary-container px-8 max-sm:px-6 text-sm font-semibold text-on-primary-container shadow-[0_0_16px_rgba(52,211,153,0.2)] transition-all duration-200 hover:bg-primary disabled:pointer-events-none disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current">
              <path d={ativa && sessao.status === "emAndamento" ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"} />
            </svg>
            {!ativa ? "Iniciar" : sessao.status === "emAndamento" ? "Pausar" : "Continuar"}
          </button>

          <button type="button" title="Pular fase" disabled={!ativa} onClick={pularFase} className={botaoIcone}>
            <svg viewBox="0 0 24 24" className="size-5 fill-current">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          <BotaoConfirmacao
            titulo="Encerrar sessão?"
            mensagem={`${posicaoAtual} O timer para e a sessão atual é descartada. A contagem de ciclos e o tempo já corrido serão perdidos e não poderão ser recuperados.`}
            rotuloConfirmar="Encerrar sessão"
            rotuloCancelar="Manter sessão"
            onConfirmar={encerrar}
            title="Encerrar sessão"
            rotuloAcessivel="Encerrar sessão"
            disabled={!ativa}
            className={`${botaoIcone} hover:border-error/20 hover:bg-error-container/20 hover:text-error`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
              <path d="M6 6h12v12H6z" />
            </svg>
          </BotaoConfirmacao>
        </div>

        {semPreset && (
          <p className="mt-4 text-xs text-on-surface-variant">
            Cadastre um preset em{" "}
            <BotaoPainel nome="presets" className="cursor-pointer text-primary hover:underline">
              Meus Presets
            </BotaoPainel>{" "}
            para iniciar.
          </p>
        )}
      </div>
    </section>
  );
}
