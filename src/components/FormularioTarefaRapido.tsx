import { useId, useRef, type FormEvent } from "react";
import { useFormularioTarefa } from "@/hooks/useFormularioTarefa";
import {
  estadosTarefa,
  limitesTitulo,
  nomesEstado,
  nomesPrioridade,
  prioridadesTarefa,
  tamanhoTitulo,
} from "@/lib/tarefa";

const estiloCampo =
  "h-9 w-full rounded-lg border bg-surface-container-low px-3 text-xs text-on-surface transition-colors placeholder:text-on-surface-variant/60 focus:border-primary-container focus:outline-none";

const estiloRotulo = "text-[11px] font-medium text-on-surface-variant";

type Props = {
  bloqueio?: string;
};

export default function FormularioTarefaRapido({ bloqueio }: Props){
  const id = useId();
  const campoTitulo = useRef<HTMLInputElement>(null);
  const { formulario, erros, errosValidacao, invalido, erroAoSalvar, alterar, reiniciar, salvar } =
    useFormularioTarefa();

  const caracteres = tamanhoTitulo(formulario.titulo);
  const idCampoTitulo = `${id}-titulo`;
  const idAjudaTitulo = `${id}-titulo-ajuda`;
  const idErro = (campo: "titulo" | "estado" | "prioridade") => `${id}-${campo}-erro`;
  const idBloqueio = `${id}-bloqueio`;

  function adicionar(evento: FormEvent<HTMLFormElement>){
    evento.preventDefault();
    if(bloqueio) return;

    if(salvar()){
      reiniciar();
      campoTitulo.current?.focus();
    } else if(errosValidacao.titulo){
      campoTitulo.current?.focus();
    }
  }

  return (
    <form
      noValidate
      onSubmit={adicionar}
      aria-label="Adicionar tarefa"
      aria-describedby={bloqueio ? idBloqueio : undefined}
      className="flex flex-col gap-3 rounded-xl border border-outline-variant/70 bg-surface-container p-3"
    >
      {bloqueio && (
        <p id={idBloqueio} className="text-[11px] text-on-surface-variant">
          {bloqueio}
        </p>
      )}

      <fieldset disabled={Boolean(bloqueio)} className="flex min-w-0 flex-col gap-3 disabled:opacity-50">
        <div className="flex flex-col gap-1">
          <label htmlFor={idCampoTitulo} className="sr-only">
            Título da nova tarefa
          </label>
          <input
            id={idCampoTitulo}
            ref={campoTitulo}
            type="text"
            placeholder="Nova tarefa…"
            value={formulario.titulo}
            onChange={(e) => alterar("titulo", e.target.value)}
            aria-invalid={erros.titulo ? true : undefined}
            aria-describedby={erros.titulo ? idErro("titulo") : idAjudaTitulo}
            className={`${estiloCampo} ${erros.titulo ? "border-error" : "border-outline-variant/70"}`}
          />
          <div className="flex items-start justify-between gap-2 text-[11px]">
            {erros.titulo ? (
              <span id={idErro("titulo")} className="text-error">
                {erros.titulo}
              </span>
            ) : (
              <span id={idAjudaTitulo} className="text-on-surface-variant/70">
                {limitesTitulo.min} a {limitesTitulo.max} caracteres
              </span>
            )}
            <span
              aria-hidden="true"
              className={`shrink-0 font-mono ${caracteres > limitesTitulo.max ? "text-error" : "text-on-surface-variant/70"}`}
            >
              {caracteres}/{limitesTitulo.max}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex min-w-0 flex-col gap-1">
            <span className={estiloRotulo}>Estado</span>
            <select
              value={formulario.estado}
              onChange={(e) => alterar("estado", e.target.value)}
              aria-invalid={erros.estado ? true : undefined}
              aria-describedby={erros.estado ? idErro("estado") : undefined}
              className={`${estiloCampo} scheme-dark ${erros.estado ? "border-error" : "border-outline-variant/70"}`}
            >
              {estadosTarefa.map((estado) => (
                <option key={estado} value={estado}>
                  {nomesEstado[estado]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span className={estiloRotulo}>Prioridade</span>
            <select
              value={formulario.prioridade}
              onChange={(e) => alterar("prioridade", e.target.value)}
              aria-invalid={erros.prioridade ? true : undefined}
              aria-describedby={erros.prioridade ? idErro("prioridade") : undefined}
              className={`${estiloCampo} scheme-dark ${erros.prioridade ? "border-error" : "border-outline-variant/70"}`}
            >
              {prioridadesTarefa.map((prioridade) => (
                <option key={prioridade} value={prioridade}>
                  {nomesPrioridade[prioridade]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {erros.estado && (
          <p id={idErro("estado")} className="text-[11px] text-error">
            {erros.estado}
          </p>
        )}
        {erros.prioridade && (
          <p id={idErro("prioridade")} className="text-[11px] text-error">
            {erros.prioridade}
          </p>
        )}
        {erroAoSalvar && (
          <p role="alert" className="text-xs text-error">
            {erroAoSalvar}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            aria-disabled={invalido}
            className="flex h-8 items-center gap-1 rounded-lg bg-primary px-3.5 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-container aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-primary"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Adicionar
          </button>
        </div>
      </fieldset>
    </form>
  );
}
