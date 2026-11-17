import { presetPadrao, type Preset } from "./preset";
import type { SessaoAtiva } from "./sessao";

const CHAVE_SESSAO = "pomodoro.sessaoAtiva";
const CHAVE_PRESETS = "pomodoro.presets";

function parametrosValidos(dados: unknown){
  if(typeof dados !== "object" || dados === null) return false;

  const parametros = dados as Record<string, unknown>;

  return (
    typeof parametros.nome === "string" &&
    typeof parametros.tempoFocoMin === "number" &&
    typeof parametros.tempoPausaCurtaMin === "number" &&
    typeof parametros.ciclosAntesPausaLonga === "number" &&
    typeof parametros.tempoPausaLongaMin === "number"
  );
}

function presetValido(dados: unknown): dados is Preset{
  if(!parametrosValidos(dados)) return false;

  const preset = dados as Record<string, unknown>;
  return typeof preset.id === "string" && typeof preset.criadoEm === "number";
}

function sessaoValida(dados: unknown): dados is SessaoAtiva{
  if(typeof dados !== "object" || dados === null) return false;

  const sessao = dados as Record<string, unknown>;

  return (
    typeof sessao.id === "string" &&
    typeof sessao.presetId === "string" &&
    typeof sessao.cicloAtual === "number" &&
    typeof sessao.fimFasePrevistoEm === "number" &&
    ["foco", "pausaCurta", "pausaLonga"].includes(sessao.faseAtual as string) &&
    ["emAndamento", "pausada", "concluida"].includes(sessao.status as string) &&
    (sessao.status !== "pausada" || typeof sessao.tempoRestanteAoPausarMs === "number") &&
    parametrosValidos(sessao.snapshotPreset)
  );
}

export function lerSessao(): SessaoAtiva | null{
  try{
    const salvo = localStorage.getItem(CHAVE_SESSAO);
    if(!salvo) return null;

    const dados: unknown = JSON.parse(salvo);
    return sessaoValida(dados) ? dados : null;
  } catch{
    return null;
  }
}

export function gravarSessao(sessao: SessaoAtiva | null){
  if(sessao){
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  } else{
    localStorage.removeItem(CHAVE_SESSAO);
  }
}

export function lerPresets(): Preset[]{
  try{
    const salvo = localStorage.getItem(CHAVE_PRESETS);
    if(!salvo) return [presetPadrao];

    const dados: unknown = JSON.parse(salvo);
    return Array.isArray(dados) ? dados.filter(presetValido) : [];
  } catch{
    return [];
  }
}

export function gravarPresets(presets: Preset[]){
  localStorage.setItem(CHAVE_PRESETS, JSON.stringify(presets));
}
