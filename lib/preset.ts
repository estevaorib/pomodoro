export type Preset = {
  id: string;
  nome: string;
  tempoFocoMin: number;
  tempoPausaCurtaMin: number;
  ciclosAntesPausaLonga: number;
  tempoPausaLongaMin: number;
  criadoEm: number;
  atualizadoEm: number;
};

export type SnapshotPreset = Pick<
  Preset,
  "nome" | "tempoFocoMin" | "tempoPausaCurtaMin" | "ciclosAntesPausaLonga" | "tempoPausaLongaMin"
>;

export const presetPadrao: Preset = {
  id: "padrao",
  nome: "Estudo Padrão",
  tempoFocoMin: 25,
  tempoPausaCurtaMin: 5,
  ciclosAntesPausaLonga: 4,
  tempoPausaLongaMin: 15,
  criadoEm: 0,
  atualizadoEm: 0,
};
