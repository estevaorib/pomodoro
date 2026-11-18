"use client";

import { useRef, useState } from "react";
import { removerTarefa, useTarefas } from "@/hooks/useTarefas";
import { nomesEstado, nomesPrioridade } from "@/lib/tarefa";
import BotaoConfirmacao from "./BotaoConfirmacao";
import ModalTarefa from "./ModalTarefa";

const estiloBotao =
  "rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 text-xs text-on-surface transition-colors hover:bg-surface-container-high";

export default function ListaTarefas(){
  const tarefas = useTarefas();
  const tituloSecao = useRef<HTMLHeadingElement>(null);
  const [erro, setErro] = useState("");

  function excluir(id: string){
    try{
      removerTarefa(id);
      setErro("");
      tituloSecao.current?.focus();
    } catch{
      setErro("Não foi possível excluir a tarefa no navegador.");
    }
  }

  return (
    <section id="tarefas" aria-labelledby="titulo-lista-tarefas" className="border-t border-outline-variant/60 py-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="titulo-lista-tarefas" ref={tituloSecao} tabIndex={-1} className="text-xl font-semibold text-on-surface">
          Tarefas
        </h2>
        <ModalTarefa className={estiloBotao}>Nova tarefa</ModalTarefa>
      </div>

      {erro && (
        <p role="alert" className="mb-3 text-xs text-error">
          {erro}
        </p>
      )}

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
            <div className="flex shrink-0 items-center gap-2">
              <ModalTarefa tarefa={tarefa} rotuloAcessivel={`Editar tarefa: ${tarefa.titulo}`} className={estiloBotao}>
                Editar
              </ModalTarefa>
              <BotaoConfirmacao
                titulo="Excluir tarefa?"
                mensagem={`A tarefa "${tarefa.titulo}" será excluída permanentemente.`}
                rotuloConfirmar="Excluir"
                onConfirmar={() => excluir(tarefa.id)}
                rotuloAcessivel={`Excluir tarefa: ${tarefa.titulo}`}
                className={`${estiloBotao} hover:border-error/40 hover:text-error`}
              >
                Excluir
              </BotaoConfirmacao>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
