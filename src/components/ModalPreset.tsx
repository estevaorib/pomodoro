import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { adicionarPreset, substituirPreset } from "@/hooks/usePresets";
import {
  criarPreset,
  editarPreset,
  limitesPreset,
  paraFormulario,
  presetPadrao,
  validarPreset,
  type CampoNumerico,
  type FormularioPreset,
  type Preset,
} from "@/lib/preset";

const formularioInicial: FormularioPreset = { ...paraFormulario(presetPadrao), nome: "" };

const camposNumericos: { campo: CampoNumerico; rotulo: string }[] = [
  { campo: "tempoFocoMin", rotulo: "Foco (min)" },
  { campo: "tempoPausaCurtaMin", rotulo: "Pausa curta (min)" },
  { campo: "ciclosAntesPausaLonga", rotulo: "Ciclos até a pausa longa" },
  { campo: "tempoPausaLongaMin", rotulo: "Pausa longa (min)" },
];

const estiloCampo =
  "h-9 w-full rounded-lg border bg-surface-container-low px-3 text-xs text-on-surface transition-colors placeholder:text-on-surface-variant/60 focus:border-primary-container focus:outline-none";

type Props = {
  preset?: Preset;
  title?: string;
  className: string;
  children: ReactNode;
};

export default function ModalPreset({ preset, title, className, children }: Props){
  const modal = useRef<HTMLDialogElement>(null);
  const campoNome = useRef<HTMLInputElement>(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [erroAoSalvar, setErroAoSalvar] = useState("");

  const erros = tentouSalvar ? validarPreset(formulario) : {};

  function alterar(campo: keyof FormularioPreset, valor: string){
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function abrir(){
    setFormulario(preset ? paraFormulario(preset) : formularioInicial);
    setTentouSalvar(false);
    setErroAoSalvar("");
    modal.current?.showModal();
    campoNome.current?.focus();
  }

  function salvar(evento: FormEvent<HTMLFormElement>){
    evento.preventDefault();
    setTentouSalvar(true);

    if(Object.keys(validarPreset(formulario)).length > 0) return;

    try{
      if(preset) substituirPreset(editarPreset(preset, formulario, Date.now()));
      else adicionarPreset(criarPreset(formulario, Date.now()));
      modal.current?.close();
    } catch{
      setErroAoSalvar("Não foi possível salvar o preset no navegador.");
    }
  }

  return (
    <>
      <button type="button" title={title} onClick={abrir} className={className}>
        {children}
      </button>

      <dialog
        ref={modal}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface backdrop:bg-surface-container-lowest/80 backdrop:backdrop-blur-sm"
      >
        <form noValidate onSubmit={salvar} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">{preset ? "Editar Preset" : "Novo Preset de Estudo"}</h3>
            <button
              type="button"
              title="Fechar"
              onClick={() => modal.current?.close()}
              className="text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <svg viewBox="0 0 24 24" className="size-4.5 fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-on-surface-variant">Nome</span>
            <input
              ref={campoNome}
              type="text"
              maxLength={40}
              placeholder="Ex: Revisão para a prova"
              value={formulario.nome}
              onChange={(e) => alterar("nome", e.target.value)}
              className={`${estiloCampo} ${erros.nome ? "border-error" : "border-outline-variant/70"}`}
            />
            {erros.nome && <span className="text-[11px] text-error">{erros.nome}</span>}
          </label>

          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {camposNumericos.map(({ campo, rotulo }) => (
              <label key={campo} className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-on-surface-variant">
                  {rotulo} · {limitesPreset[campo].min} a {limitesPreset[campo].max}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={limitesPreset[campo].min}
                  max={limitesPreset[campo].max}
                  step={1}
                  value={formulario[campo]}
                  onChange={(e) => alterar(campo, e.target.value)}
                  className={`${estiloCampo} font-mono ${erros[campo] ? "border-error" : "border-outline-variant/70"}`}
                />
                {erros[campo] && <span className="text-[11px] text-error">{erros[campo]}</span>}
              </label>
            ))}
          </div>

          {erroAoSalvar && <p className="text-xs text-error">{erroAoSalvar}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => modal.current?.close()}
              className="rounded-lg px-3.5 py-1.5 text-xs text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-container"
            >
              Salvar Preset
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
