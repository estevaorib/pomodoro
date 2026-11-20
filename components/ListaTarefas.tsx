"use client";

import { useRef, useState, type RefObject } from "react";
import { removerTarefa, useTarefas } from "@/hooks/useTarefas";
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
  const tituloPainel = useRef<HTMLHeadingElement>(null);

  const cabecalho = {
    nome: "tarefas",
    sobretitulo: "Planejamento",
    titulo: "Tarefas",
    refTitulo: tituloPainel,
    complemento: tarefas && (
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
  const [erro, setErro] = useState("");

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
        <FormularioTarefaRapido />

        {erro && (
          <p role="alert" className="text-xs text-error">
            {erro}
          </p>
        )}
      </div>

      <div className={`pb-6 ${rolavel ? "min-h-0 flex-1 overflow-y-auto" : ""} ${recuoLateral}`}>
        {tarefas?.length === 0 && (
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
