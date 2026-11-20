import { estadoValido, prioridadeValida, tituloValido, type Tarefa } from "./tarefa";

const CHAVE_TAREFAS = "pomodoro.tarefas";

export type LeituraTarefas =
  | { corrompido: false; tarefas: Tarefa[]; ignoradas: number }
  | { corrompido: true };

function tarefaValida(dados: unknown): dados is Tarefa{
  if(typeof dados !== "object" || dados === null) return false;

  const tarefa = dados as Record<string, unknown>;

  return (
    typeof tarefa.id === "string" &&
    typeof tarefa.titulo === "string" &&
    tituloValido(tarefa.titulo) &&
    estadoValido(tarefa.estado) &&
    prioridadeValida(tarefa.prioridade) &&
    typeof tarefa.criadaEm === "number" &&
    typeof tarefa.atualizadaEm === "number"
  );
}


export function lerTarefas(): LeituraTarefas{
  let salvo: string | null;
  try{
    salvo = localStorage.getItem(CHAVE_TAREFAS);
  } catch{
    return { corrompido: false, tarefas: [], ignoradas: 0 };
  }
  if(salvo === null) return { corrompido: false, tarefas: [], ignoradas: 0 };

  let dados: unknown;
  try{
    dados = JSON.parse(salvo);
  } catch{
    return { corrompido: true };
  }
  if(!Array.isArray(dados)) return { corrompido: true };

  const tarefas = dados.filter(tarefaValida);
  return { corrompido: false, tarefas, ignoradas: dados.length - tarefas.length };
}

export function gravarTarefas(tarefas: Tarefa[]){
  localStorage.setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
}

export function descartarTarefas(){
  localStorage.removeItem(CHAVE_TAREFAS);
}
