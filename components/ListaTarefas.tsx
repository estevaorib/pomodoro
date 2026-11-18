"use client";

import { useTarefas } from "@/hooks/useTarefas";
import { nomesEstado, nomesPrioridade } from "@/lib/tarefa";
import ModalTarefa from "./ModalTarefa";

const estiloBotao =
  "rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 text-xs text-on-surface transition-colors hover:bg-surface-container-high";

export default function ListaTarefas(){
  const tarefas = useTarefas();

  return (
    <section id="tarefas" aria-labelledby="titulo-lista-tarefas" className="border-t border-outline-variant/60 py-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="titulo-lista-tarefas" className="text-xl font-semibold text-on-surface">
          Tarefas
        </h2>
        <ModalTarefa className={estiloBotao}>Nova tarefa</ModalTarefa>
      </div>

      {tarefas?.length === 0 && <p className="text-xs text-on-surface-variant">Nenhuma tarefa cadastrada.</p>}

      <ul className="flex flex-col gap-2">
        {tarefas?.map((tarefa) => (
          <li
            key={tarefa.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/70 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-on-surface" title={tarefa.titulo}>
                {tarefa.titulo}
              </p>
              <p className="text-xs text-on-surface-variant">
                Estado: {nomesEstado[tarefa.estado]} · Prioridade: {nomesPrioridade[tarefa.prioridade]}
              </p>
            </div>
            <ModalTarefa tarefa={tarefa} rotuloAcessivel={`Editar tarefa: ${tarefa.titulo}`} className={estiloBotao}>
              Editar
            </ModalTarefa>
          </li>
        ))}
      </ul>
    </section>
  );
}
