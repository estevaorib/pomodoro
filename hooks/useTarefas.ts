import { useMemo, useSyncExternalStore } from "react";
import { gravarTarefas, lerTarefas } from "@/lib/armazenamento";
import { ordenarTarefas, type Tarefa } from "@/lib/tarefa";

let tarefasAtuais: Tarefa[] | null = null;
const ouvintes = new Set<() => void>();

function obterTarefas(){
  tarefasAtuais ??= lerTarefas();
  return tarefasAtuais;
}

function assinar(ouvinte: () => void){
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function salvar(proximas: Tarefa[]){
  gravarTarefas(proximas);
  tarefasAtuais = proximas;
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function adicionarTarefa(tarefa: Tarefa){
  salvar([...obterTarefas(), tarefa]);
}

export function substituirTarefa(tarefa: Tarefa){
  salvar(obterTarefas().map((atual) => (atual.id === tarefa.id ? tarefa : atual)));
}

export function useTarefas(){
  const tarefas = useSyncExternalStore(assinar, obterTarefas, () => null);
  return useMemo(() => (tarefas ? ordenarTarefas(tarefas) : null), [tarefas]);
}
