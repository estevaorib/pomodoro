import { useMemo, useSyncExternalStore } from "react";
import { descartarTarefas, gravarTarefas, lerTarefas } from "@/lib/armazenamentoTarefas";
import { ordenarTarefas, type Tarefa } from "@/lib/tarefa";

type EstadoTarefas = {
  tarefas: Tarefa[];
  // Dado salvo ilegível: fica preservado e nada é gravado até o usuário descartá-lo.
  corrompido: boolean;
  // Itens inválidos descartados na leitura, ainda não dispensados pelo usuário.
  ignoradas: number;
};

let estadoAtual: EstadoTarefas | null = null;
const ouvintes = new Set<() => void>();

function obterEstado(){
  if(!estadoAtual){
    const leitura = lerTarefas();
    estadoAtual = leitura.corrompido
      ? { tarefas: [], corrompido: true, ignoradas: 0 }
      : { tarefas: leitura.tarefas, corrompido: false, ignoradas: leitura.ignoradas };
  }
  return estadoAtual;
}

function assinar(ouvinte: () => void){
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function atualizar(proximo: EstadoTarefas){
  estadoAtual = proximo;
  ouvintes.forEach((ouvinte) => ouvinte());
}

function salvar(proximas: Tarefa[]){
  const estado = obterEstado();
  if(estado.corrompido) throw new Error("As tarefas salvas estão corrompidas; descarte-as antes de gravar.");

  gravarTarefas(proximas);
  atualizar({ ...estado, tarefas: proximas });
}

export function adicionarTarefa(tarefa: Tarefa){
  salvar([...obterEstado().tarefas, tarefa]);
}

export function substituirTarefa(tarefa: Tarefa){
  salvar(obterEstado().tarefas.map((atual) => (atual.id === tarefa.id ? tarefa : atual)));
}

export function removerTarefa(id: string){
  salvar(obterEstado().tarefas.filter((tarefa) => tarefa.id !== id));
}

export function descartarTarefasCorrompidas(){
  descartarTarefas();
  atualizar({ tarefas: [], corrompido: false, ignoradas: 0 });
}

export function dispensarAvisoIgnoradas(){
  atualizar({ ...obterEstado(), ignoradas: 0 });
}

function useEstadoTarefas(){
  // Snapshot de servidor `null`: no servidor e na hidratação nada do localStorage é lido.
  return useSyncExternalStore(assinar, obterEstado, () => null);
}

export function useTarefas(){
  const tarefas = useEstadoTarefas()?.tarefas;
  return useMemo(() => (tarefas ? ordenarTarefas(tarefas) : null), [tarefas]);
}

export function useAvisosTarefas(){
  const estado = useEstadoTarefas();
  return estado ? { corrompido: estado.corrompido, ignoradas: estado.ignoradas } : null;
}
