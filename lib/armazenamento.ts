import type { SessaoAtiva } from "./sessao";

const CHAVE_SESSAO = "pomodoro.sessaoAtiva";

function sessaoValida(dados: unknown): dados is SessaoAtiva {
  if (typeof dados !== "object" || dados === null) return false;

  const sessao = dados as Record<string, unknown>;
  const snapshot = sessao.snapshotPreset as Record<string, unknown> | null | undefined;

  return (
    typeof sessao.id === "string" &&
    typeof sessao.presetId === "string" &&
    typeof sessao.cicloAtual === "number" &&
    typeof sessao.fimFasePrevistoEm === "number" &&
    ["foco", "pausaCurta", "pausaLonga"].includes(sessao.faseAtual as string) &&
    ["emAndamento", "pausada", "concluida"].includes(sessao.status as string) &&
    (sessao.status !== "pausada" || typeof sessao.tempoRestanteAoPausarMs === "number") &&
    typeof snapshot === "object" &&
    snapshot !== null &&
    typeof snapshot.nome === "string" &&
    typeof snapshot.tempoFocoMin === "number" &&
    typeof snapshot.tempoPausaCurtaMin === "number" &&
    typeof snapshot.ciclosAntesPausaLonga === "number" &&
    typeof snapshot.tempoPausaLongaMin === "number"
  );
}

export function lerSessao(): SessaoAtiva | null {
  try {
    const salvo = localStorage.getItem(CHAVE_SESSAO);
    if (!salvo) return null;

    const dados: unknown = JSON.parse(salvo);
    return sessaoValida(dados) ? dados : null;
  } catch {
    return null;
  }
}

export function gravarSessao(sessao: SessaoAtiva | null) {
  if (sessao) {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  } else {
    localStorage.removeItem(CHAVE_SESSAO);
  }
}
