import { useSyncExternalStore } from "react";
import { gravarPresets, lerPresets } from "@/lib/armazenamento";
import type { Preset } from "@/lib/preset";
import { useSessaoAtual } from "./useSessao";

let presetsAtuais: Preset[] | null = null;
let selecionadoId: string | null = null;
const ouvintes = new Set<() => void>();

function obterPresets(){
  presetsAtuais ??= lerPresets();
  return presetsAtuais;
}

function assinar(ouvinte: () => void){
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function salvar(proximos: Preset[]){
  gravarPresets(proximos);
  presetsAtuais = proximos;
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function adicionarPreset(preset: Preset){
  salvar([...obterPresets(), preset]);
}

export function substituirPreset(preset: Preset){
  salvar(obterPresets().map((atual) => (atual.id === preset.id ? preset : atual)));
}

export function removerPreset(id: string){
  salvar(obterPresets().filter((preset) => preset.id !== id));
}

export function selecionarPreset(id: string){
  selecionadoId = id;
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function usePresets(){
  return useSyncExternalStore(assinar, obterPresets, () => null);
}

export function usePresetSelecionado(){
  const presets = usePresets();
  const sessao = useSessaoAtual();
  const id = useSyncExternalStore(assinar, () => selecionadoId, () => null);

  if(!presets) return undefined;
  return presets.find((preset) => preset.id === (id ?? sessao?.presetId)) ?? presets[0] ?? null;
}
