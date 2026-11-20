"use client";

import { useRef, useState, type RefObject } from "react";
import {
  descartarTarefasCorrompidas,
  dispensarAvisoIgnoradas,
  removerTarefa,
  useAvisosTarefas,
  useTarefas,
} from "@/hooks/useTarefas";
import { nomesEstado, nomesPrioridade, type EstadoTarefa, type PrioridadeTarefa, type Tarefa } from "@/lib/tarefa";
import BotaoConfirmacao from "./BotaoConfirmacao";
import FormularioTarefaRapido from "./FormularioTarefaRapido";
import ModalTarefa from "./ModalTarefa";
import { idPainel, idTituloPainel, usePaineis } from "./PaineisContexto";
import PainelLateral, { CabecalhoPainel, recuoLateral } from "./PainelLateral";

const indicadorPrioridade: Record<PrioridadeTarefa, string> = {
  alta: "bg-primary shadow-[0_0_6px_rgba(90,240,179,0.5)]",
  media: "bg-primary/55",
  baixa: "bg-primary/20",
};

const chipEstado: Record<EstadoTarefa, string> = {
  backlog: "border-outline-variant/70 text-on-surface-variant",
  aFazer: "border-outline-variant text-on-surface",
  emExecucao: "border-primary/30 bg-primary/15 text-primary",
  concluida: "border-outline-variant/70 text-on-surface-variant",
  cancelada: "border-outline-variant/70 text-on-surface-variant",
};

const estadosEncerrados: EstadoTarefa[] = ["concluida", "cancelada"];

const botaoAcao =
  "flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface";

const reveladoNoHover =
  "transition-opacity lg:pointer-fine:opacity-0 lg:pointer-fine:group-hover:opacity-100 lg:pointer-fine:group-focus-within:opacity-100";

export default function ListaTarefas(){
  const { desktop } = usePaineis();
  const tarefas = useTarefas();
  const avisos = useAvisosTarefas();
  const tituloPainel = useRef<HTMLHeadingElement>(null);

  const cabecalho = {
    nome: "tarefas",
    sobretitulo: "Planejamento",
    titulo: "Tarefas",
    refTitulo: tituloPainel,
    complemento: tarefas && !avisos?.corrompido && (
      <span className="shrink-0 rounded-full border border-outline-variant bg-surface-container px-2.5 py-0.5 font-mono text-[11px] text-on-surface-variant">
        {tarefas.length} {tarefas.length === 1 ? "tarefa" : "tarefas"}
      </span>
    ),
  } as const;

  if(desktop){
    return (
      <PainelLateral {...cabecalho} rotuloFechar="Fechar painel de tarefas" somenteDesktop>
        <ConteudoTarefas tarefas={tarefas} tituloPainel={tituloPainel} rolavel />
      </PainelLateral>
    );
  }

  return (
    <section
      id={idPainel("tarefas")}
      aria-labelledby={idTituloPainel("tarefas")}
      className="w-full border-t border-outline-variant/60 bg-surface"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col">
        <div className={`pt-10 pb-4 ${recuoLateral}`}>
          <CabecalhoPainel {...cabecalho} />
        </div>
        <ConteudoTarefas tarefas={tarefas} tituloPainel={tituloPainel} rolavel={false} />
      </div>
    </section>
  );
}

type PropsConteudo = {
  tarefas: Tarefa[] | null;
  tituloPainel: RefObject<HTMLHeadingElement | null>;
  rolavel: boolean;
};

function ConteudoTarefas({ tarefas, tituloPainel, rolavel }: PropsConteudo){
  const avisos = useAvisosTarefas();
  const [erro, setErro] = useState("");
  const corrompido = avisos?.corrompido ?? false;
  const ignoradas = avisos?.ignoradas ?? 0;

  function descartar(){
    try{
      descartarTarefasCorrompidas();
      setErro("");
      tituloPainel.current?.focus();
    } catch{
      setErro("Não foi possível descartar os dados no navegador.");
    }
  }

  function dispensarAviso(){
    dispensarAvisoIgnoradas();
    tituloPainel.current?.focus();
  }

  function excluir(id: string){
    try{
      removerTarefa(id);
      setErro("");
      tituloPainel.current?.focus();
    } catch{
      setErro("Não foi possível excluir a tarefa no navegador.");
    }
  }

  return (
    <>
      <div className={`flex flex-col gap-4 pb-4 ${recuoLateral}`}>
        {corrompido && (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-error/40 bg-error-container/15 p-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-error">
                As tarefas salvas estão corrompidas e não puderam ser carregadas.
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Os dados continuam guardados no navegador. Para começar uma lista nova, descarte-os.
              </p>
            </div>
            <BotaoConfirmacao
              titulo="Descartar dados das tarefas?"
              mensagem="Os dados de tarefas salvos neste navegador serão apagados permanentemente e a lista começará vazia."
              rotuloConfirmar="Descartar dados"
              onConfirmar={descartar}
              className="self-start rounded-lg border border-error/40 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error-container/20"
            >
              Descartar dados
            </BotaoConfirmacao>
          </div>
        )}

        {ignoradas > 0 && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-outline-variant/70 bg-surface-container-low py-2 pr-1 pl-3"
          >
            <p className="flex-1 py-1 text-[11px] text-on-surface-variant">
              {ignoradas === 1
                ? "1 tarefa inválida foi ignorada."
                : `${ignoradas} tarefas inválidas foram ignoradas.`}
            </p>
            <button
              type="button"
              aria-label="Fechar aviso de tarefas ignoradas"
              title="Fechar aviso"
              onClick={dispensarAviso}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        )}

        <FormularioTarefaRapido
          bloqueio={
            corrompido
              ? "A criação de tarefas está bloqueada até que os dados corrompidos sejam descartados."
              : undefined
          }
        />

        {erro && (
          <p role="alert" className="text-xs text-error">
            {erro}
          </p>
        )}
      </div>

      <div className={`pb-6 ${rolavel ? "min-h-0 flex-1 overflow-y-auto" : ""} ${recuoLateral}`}>
        {tarefas?.length === 0 && !corrompido && (
          <p className="rounded-xl border border-dashed border-outline-variant/70 p-6 text-center text-xs text-on-surface-variant">
            Nenhuma tarefa por aqui. Adicione a primeira acima.
          </p>
        )}

        {tarefas && tarefas.length > 0 && (
          <ul aria-label="Lista de tarefas" className="flex flex-col gap-2">
            {tarefas.map((tarefa) => {
              const encerrada = estadosEncerrados.includes(tarefa.estado);

              return (
                <li
                  key={tarefa.id}
                  className="group relative flex items-start gap-2 rounded-xl border border-outline-variant/70 bg-surface-container py-3 pr-2 pl-4 transition-colors focus-within:bg-surface-container-high hover:bg-surface-container-high"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-3 left-0 w-[3px] rounded-r-full ${indicadorPrioridade[tarefa.prioridade]} ${encerrada ? "opacity-50" : ""}`}
                  />

                  <div className={`min-w-0 flex-1 ${encerrada ? "opacity-50" : ""}`}>
                    <p className="text-sm font-medium break-words text-on-surface">{tarefa.titulo}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase ${chipEstado[tarefa.estado]}`}
                      >
                        {nomesEstado[tarefa.estado]}
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant">
                        Prioridade {nomesPrioridade[tarefa.prioridade].toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div className={`flex shrink-0 items-center ${reveladoNoHover}`}>
                    <ModalTarefa tarefa={tarefa} rotuloAcessivel={`Editar tarefa: ${tarefa.titulo}`} className={botaoAcao}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </ModalTarefa>
                    <BotaoConfirmacao
                      titulo="Excluir tarefa?"
                      mensagem={`A tarefa "${tarefa.titulo}" será excluída permanentemente.`}
                      rotuloConfirmar="Excluir"
                      onConfirmar={() => excluir(tarefa.id)}
                      rotuloAcessivel={`Excluir tarefa: ${tarefa.titulo}`}
                      className={`${botaoAcao} hover:bg-error-container/20 hover:text-error`}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </BotaoConfirmacao>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
