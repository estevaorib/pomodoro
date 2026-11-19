"use client";

import { useState } from "react";
import { removerPreset, selecionarPreset, usePresets, usePresetSelecionado } from "@/hooks/usePresets";
import { iniciarComPreset, useSessaoAtual } from "@/hooks/useSessao";
import type { Preset } from "@/lib/preset";
import BotaoConfirmacao from "./BotaoConfirmacao";
import ModalPreset from "./ModalPreset";
import PainelLateral, { recuoLateral } from "./PainelLateral";

export default function Presets(){
  const presets = usePresets();
  const sessao = useSessaoAtual();
  const selecionado = usePresetSelecionado();
  const [erro, setErro] = useState("");
  const presetEmUso = sessao && sessao.status !== "concluida" ? sessao.presetId : null;

  function usar(preset: Preset){
    if(presetEmUso) iniciarComPreset(preset);
    selecionarPreset(preset.id);
    document.getElementById("temporizador")?.scrollIntoView({ behavior: "smooth" });
  }

  function excluir(id: string){
    try{
      removerPreset(id);
      setErro("");
    } catch{
      setErro("Não foi possível excluir o preset no navegador.");
    }
  }

  return (
    <PainelLateral
      nome="presets"
      sobretitulo="Configuração"
      titulo="Meus Presets de Tempo"
      rotuloFechar="Fechar painel de presets"
    >
      <div className={`min-h-0 flex-1 overflow-y-auto pb-6 ${recuoLateral}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-on-surface-variant">Foco / Pausa Curta / Ciclos / Pausa Longa</p>

          <ModalPreset className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container px-3.5 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-high">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-primary">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Novo Preset
          </ModalPreset>
        </div>

        {erro && <p className="mb-3 text-xs text-error">{erro}</p>}

        {presets?.length === 0 && (
          <p className="rounded-xl border border-dashed border-outline-variant/70 p-6 text-center text-xs text-on-surface-variant">
            Nenhum preset cadastrado.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {presets?.map((preset) => {
            const emUso = preset.id === presetEmUso;
            const escolhido = !presetEmUso && preset.id === selecionado?.id;

            return (
              <div
                key={preset.id}
                className={`flex flex-col gap-3 rounded-xl bg-surface-container p-4 ${
                  emUso
                    ? "border-2 border-primary/50 shadow-[0_0_12px_rgba(52,211,153,0.08)]"
                    : escolhido
                      ? "border border-primary/40"
                      : "border border-outline-variant/70"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-on-surface" title={preset.nome}>
                    {preset.nome}
                  </span>
                  {emUso ? (
                    <span className="shrink-0 rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-medium text-primary uppercase">
                      Em uso
                    </span>
                  ) : escolhido ? (
                    <span className="shrink-0 rounded-full border border-primary/30 px-2 py-0.5 font-mono text-[10px] font-medium text-primary uppercase">
                      Selecionado
                    </span>
                  ) : (
                    <span className="shrink-0 font-mono text-[10px] text-on-surface-variant">
                      {preset.tempoFocoMin}m foco
                    </span>
                  )}
                </div>

                <p className="font-mono text-xl font-light tracking-tight text-on-surface">
                  {preset.tempoFocoMin} / {preset.tempoPausaCurtaMin} / {preset.ciclosAntesPausaLonga} /{" "}
                  {preset.tempoPausaLongaMin}
                </p>

                {!emUso && !escolhido && (
                  <button
                    type="button"
                    onClick={() => usar(preset)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-container-low py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-highest"
                  >
                    Usar preset
                    <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                  </button>
                )}

                <div className="mt-auto flex items-center justify-end border-t border-outline-variant/60 pt-2">
                  {emUso ? (
                    <p className="flex w-full items-center gap-1 text-[11px] text-on-surface-variant">
                      <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-primary/80">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                      Encerre a sessão para editar ou excluir este preset.
                    </p>
                  ) : (
                    <div className="flex items-center gap-1">
                      <ModalPreset
                        preset={preset}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                      >
                        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                        Editar
                      </ModalPreset>

                      <BotaoConfirmacao
                        titulo="Excluir preset?"
                        mensagem={`O preset "${preset.nome}" será excluído permanentemente.`}
                        rotuloConfirmar="Excluir"
                        onConfirmar={() => excluir(preset.id)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-on-surface-variant transition-colors hover:bg-error-container/20 hover:text-error"
                      >
                        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                        Excluir
                      </BotaoConfirmacao>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PainelLateral>
  );
}
