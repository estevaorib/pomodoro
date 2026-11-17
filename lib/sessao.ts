import type { Preset, ParametrosPreset } from "./preset";

export type Fase = "foco" | "pausaCurta" | "pausaLonga";
export type StatusSessao = "emAndamento" | "pausada" | "concluida";

export type SessaoAtiva = {
  id: string;
  presetId: string;
  snapshotPreset: ParametrosPreset;
  faseAtual: Fase;
  cicloAtual: number;
  status: StatusSessao;
  inicioFaseEm: number;
  fimFasePrevistoEm: number;
  pausadaEm: number | null;
  tempoRestanteAoPausarMs: number | null;
  criadaEm: number;
  atualizadaEm: number;
};

const MINUTO = 60_000;

export function duracaoFase(snapshot: ParametrosPreset, fase: Fase){
  if(fase === "foco") return snapshot.tempoFocoMin * MINUTO;
  if(fase === "pausaCurta") return snapshot.tempoPausaCurtaMin * MINUTO;
  return snapshot.tempoPausaLongaMin * MINUTO;
}

function pausaDoCiclo(sessao: SessaoAtiva): Fase{
  return sessao.cicloAtual === sessao.snapshotPreset.ciclosAntesPausaLonga ? "pausaLonga" : "pausaCurta";
}

function entrarNaFase(sessao: SessaoAtiva, fase: Fase, ciclo: number, inicio: number): SessaoAtiva{
  const duracao = duracaoFase(sessao.snapshotPreset, fase);
  const pausada = sessao.status === "pausada";

  return {
    ...sessao,
    faseAtual: fase,
    cicloAtual: ciclo,
    inicioFaseEm: inicio,
    fimFasePrevistoEm: inicio + duracao,
    pausadaEm: pausada ? inicio : null,
    tempoRestanteAoPausarMs: pausada ? duracao : null,
    atualizadaEm: inicio,
  };
}

function concluir(sessao: SessaoAtiva, agora: number): SessaoAtiva{
  return {
    ...sessao,
    status: "concluida",
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    atualizadaEm: agora,
  };
}

function concluirFase(sessao: SessaoAtiva, inicioProxima: number){
  if(sessao.faseAtual === "foco"){
    return entrarNaFase(sessao, pausaDoCiclo(sessao), sessao.cicloAtual, inicioProxima);
  }
  if(sessao.faseAtual === "pausaLonga") return concluir(sessao, inicioProxima);
  return entrarNaFase(sessao, "foco", sessao.cicloAtual + 1, inicioProxima);
}

export function iniciarSessao(preset: Preset, agora: number): SessaoAtiva{
  const snapshotPreset: ParametrosPreset = {
    nome: preset.nome,
    tempoFocoMin: preset.tempoFocoMin,
    tempoPausaCurtaMin: preset.tempoPausaCurtaMin,
    ciclosAntesPausaLonga: preset.ciclosAntesPausaLonga,
    tempoPausaLongaMin: preset.tempoPausaLongaMin,
  };

  return {
    id: crypto.randomUUID(),
    presetId: preset.id,
    snapshotPreset,
    faseAtual: "foco",
    cicloAtual: 1,
    status: "emAndamento",
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + duracaoFase(snapshotPreset, "foco"),
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    criadaEm: agora,
    atualizadaEm: agora,
  };
}

export function pausarSessao(sessao: SessaoAtiva, agora: number): SessaoAtiva{
  if(sessao.status !== "emAndamento") return sessao;

  return {
    ...sessao,
    status: "pausada",
    pausadaEm: agora,
    tempoRestanteAoPausarMs: Math.max(0, sessao.fimFasePrevistoEm - agora),
    atualizadaEm: agora,
  };
}

export function retomarSessao(sessao: SessaoAtiva, agora: number): SessaoAtiva{
  if(sessao.status !== "pausada") return sessao;

  return {
    ...sessao,
    status: "emAndamento",
    fimFasePrevistoEm: agora + (sessao.tempoRestanteAoPausarMs ?? 0),
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    atualizadaEm: agora,
  };
}

export function pularFase(sessao: SessaoAtiva, agora: number): SessaoAtiva{
  if(sessao.status === "concluida") return sessao;
  if(sessao.faseAtual === "foco") return entrarNaFase(sessao, pausaDoCiclo(sessao), sessao.cicloAtual, agora);
  if(sessao.faseAtual === "pausaLonga") return concluir(sessao, agora);
  return entrarNaFase(sessao, "foco", sessao.cicloAtual, agora);
}

export function reiniciarCiclos(sessao: SessaoAtiva, agora: number): SessaoAtiva{
  if(sessao.status === "concluida") return sessao;
  return entrarNaFase(sessao, "foco", 1, agora);
}

export function sincronizar(sessao: SessaoAtiva, agora: number){
  let atual = sessao;
  let fasesConcluidas = 0;

  while(atual.status === "emAndamento" && agora >= atual.fimFasePrevistoEm){
    atual = concluirFase(atual, atual.fimFasePrevistoEm);
    fasesConcluidas++;
  }

  return { sessao: atual, fasesConcluidas };
}

export function tempoRestante(sessao: SessaoAtiva, agora: number){
  if(sessao.status === "concluida") return 0;
  if(sessao.status === "pausada") return sessao.tempoRestanteAoPausarMs ?? 0;

  const duracao = duracaoFase(sessao.snapshotPreset, sessao.faseAtual);
  return Math.min(duracao, Math.max(0, sessao.fimFasePrevistoEm - agora));
}
