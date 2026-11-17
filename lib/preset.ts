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

export type ParametrosPreset = Pick<
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

export type CampoNumerico = Exclude<keyof ParametrosPreset, "nome">;
export type FormularioPreset = Record<keyof ParametrosPreset, string>;
export type ErrosPreset = Partial<Record<keyof ParametrosPreset, string>>;

export const limitesPreset: Record<CampoNumerico, { min: number; max: number }> = {
  tempoFocoMin: { min: 1, max: 120 },
  tempoPausaCurtaMin: { min: 1, max: 60 },
  ciclosAntesPausaLonga: { min: 1, max: 12 },
  tempoPausaLongaMin: { min: 1, max: 60 },
};

export function validarPreset(formulario: FormularioPreset){
  const erros: ErrosPreset = {};
  const nome = formulario.nome.trim();

  if(nome.length < 1 || nome.length > 40){
    erros.nome = "Informe um nome entre 1 e 40 caracteres.";
  }

  for(const campo of Object.keys(limitesPreset) as CampoNumerico[]){
    const { min, max } = limitesPreset[campo];
    const texto = formulario[campo].trim();
    const valor = Number(texto);

    if(!/^\d+$/.test(texto) || valor < min || valor > max){
      erros[campo] = `Informe um número inteiro entre ${min} e ${max}.`;
    }
  }

  return erros;
}

function lerFormulario(formulario: FormularioPreset): ParametrosPreset{
  return {
    nome: formulario.nome.trim(),
    tempoFocoMin: Number(formulario.tempoFocoMin),
    tempoPausaCurtaMin: Number(formulario.tempoPausaCurtaMin),
    ciclosAntesPausaLonga: Number(formulario.ciclosAntesPausaLonga),
    tempoPausaLongaMin: Number(formulario.tempoPausaLongaMin),
  };
}

export function paraFormulario(parametros: ParametrosPreset): FormularioPreset{
  return {
    nome: parametros.nome,
    tempoFocoMin: String(parametros.tempoFocoMin),
    tempoPausaCurtaMin: String(parametros.tempoPausaCurtaMin),
    ciclosAntesPausaLonga: String(parametros.ciclosAntesPausaLonga),
    tempoPausaLongaMin: String(parametros.tempoPausaLongaMin),
  };
}

export function criarPreset(formulario: FormularioPreset, agora: number): Preset{
  return {
    id: crypto.randomUUID(),
    ...lerFormulario(formulario),
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

export function editarPreset(preset: Preset, formulario: FormularioPreset, agora: number): Preset{
  return {
    ...preset,
    ...lerFormulario(formulario),
    atualizadoEm: agora,
  };
}
