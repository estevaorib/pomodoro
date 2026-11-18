export const estadosTarefa = ["backlog", "aFazer", "emExecucao", "concluida", "cancelada"] as const;
export const prioridadesTarefa = ["baixa", "media", "alta"] as const;

export type EstadoTarefa = (typeof estadosTarefa)[number];
export type PrioridadeTarefa = (typeof prioridadesTarefa)[number];

export type Tarefa = {
  id: string;
  titulo: string;
  estado: EstadoTarefa;
  prioridade: PrioridadeTarefa;
  criadaEm: number;
  atualizadaEm: number;
};

export type ParametrosTarefa = Pick<Tarefa, "titulo" | "estado" | "prioridade">;
export type FormularioTarefa = Record<keyof ParametrosTarefa, string>;
export type ErrosTarefa = Partial<Record<keyof ParametrosTarefa, string>>;

export const valoresPadraoTarefa: ParametrosTarefa = {
  titulo: "",
  estado: "backlog",
  prioridade: "media",
};

export const limitesTitulo = { min: 1, max: 100 };

export const nomesEstado: Record<EstadoTarefa, string> = {
  backlog: "Backlog",
  aFazer: "A fazer",
  emExecucao: "Em execução",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const nomesPrioridade: Record<PrioridadeTarefa, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const ordemPrioridade: Record<PrioridadeTarefa, number> = {
  alta: 0,
  media: 1,
  baixa: 2,
};

const ordemEstado: Record<EstadoTarefa, number> = {
  aFazer: 0,
  emExecucao: 1,
  concluida: 2,
  cancelada: 3,
  backlog: 4,
};

export function tamanhoTitulo(titulo: string){
  return Array.from(titulo.trim()).length;
}

export function tituloValido(titulo: string){
  const tamanho = tamanhoTitulo(titulo);
  return tamanho >= limitesTitulo.min && tamanho <= limitesTitulo.max;
}

export function estadoValido(valor: unknown): valor is EstadoTarefa{
  return typeof valor === "string" && (estadosTarefa as readonly string[]).includes(valor);
}

export function prioridadeValida(valor: unknown): valor is PrioridadeTarefa{
  return typeof valor === "string" && (prioridadesTarefa as readonly string[]).includes(valor);
}

export function validarTarefa(formulario: FormularioTarefa){
  const erros: ErrosTarefa = {};
  const tamanho = tamanhoTitulo(formulario.titulo);

  if(tamanho < limitesTitulo.min){
    erros.titulo = "Informe o título da tarefa.";
  } else if(tamanho > limitesTitulo.max){
    erros.titulo = `O título deve ter no máximo ${limitesTitulo.max} caracteres.`;
  }

  if(!estadoValido(formulario.estado)){
    erros.estado = `Escolha um estado válido: ${Object.values(nomesEstado).join(", ")}.`;
  }

  if(!prioridadeValida(formulario.prioridade)){
    erros.prioridade = `Escolha uma prioridade válida: ${Object.values(nomesPrioridade).join(", ")}.`;
  }

  return erros;
}

function lerFormulario(formulario: FormularioTarefa): ParametrosTarefa{
  const { estado, prioridade } = formulario;
  if(!estadoValido(estado) || !prioridadeValida(prioridade)){
    throw new Error("Formulário de tarefa inválido.");
  }

  return {
    titulo: formulario.titulo.trim(),
    estado,
    prioridade,
  };
}

export function paraFormulario(parametros: ParametrosTarefa): FormularioTarefa{
  return {
    titulo: parametros.titulo,
    estado: parametros.estado,
    prioridade: parametros.prioridade,
  };
}

export function criarTarefa(formulario: FormularioTarefa, agora: number): Tarefa{
  return {
    id: crypto.randomUUID(),
    ...lerFormulario(formulario),
    criadaEm: agora,
    atualizadaEm: agora,
  };
}

export function editarTarefa(tarefa: Tarefa, formulario: FormularioTarefa, agora: number): Tarefa{
  return {
    ...tarefa,
    ...lerFormulario(formulario),
    atualizadaEm: agora,
  };
}

export function ordenarTarefas(tarefas: readonly Tarefa[]): Tarefa[]{
  return [...tarefas].sort(
    (a, b) =>
      ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade] ||
      ordemEstado[a.estado] - ordemEstado[b.estado],
  );
}
