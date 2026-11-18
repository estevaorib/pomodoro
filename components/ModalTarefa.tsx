"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { adicionarTarefa, substituirTarefa } from "@/hooks/useTarefas";
import {
  criarTarefa,
  editarTarefa,
  estadosTarefa,
  limitesTitulo,
  nomesEstado,
  nomesPrioridade,
  paraFormulario,
  prioridadesTarefa,
  validarTarefa,
  valoresPadraoTarefa,
  type FormularioTarefa,
  type Tarefa,
} from "@/lib/tarefa";

const formularioInicial: FormularioTarefa = paraFormulario(valoresPadraoTarefa);

const camposSelecao: {
  campo: "estado" | "prioridade";
  rotulo: string;
  opcoes: { valor: string; nome: string }[];
}[] = [
  {
    campo: "estado",
    rotulo: "Estado",
    opcoes: estadosTarefa.map((estado) => ({ valor: estado, nome: nomesEstado[estado] })),
  },
  {
    campo: "prioridade",
    rotulo: "Prioridade",
    opcoes: prioridadesTarefa.map((prioridade) => ({ valor: prioridade, nome: nomesPrioridade[prioridade] })),
  },
];

const estiloCampo =
  "h-9 w-full rounded-lg border bg-surface-container-low px-3 text-xs text-on-surface transition-colors placeholder:text-on-surface-variant/60 focus:border-primary-container focus:outline-none";

type Props = {
  tarefa?: Tarefa;
  rotuloAcessivel?: string;
  className: string;
  children: ReactNode;
};

export default function ModalTarefa({ tarefa, rotuloAcessivel, className, children }: Props){
  const modal = useRef<HTMLDialogElement>(null);
  const campoTitulo = useRef<HTMLInputElement>(null);
  const id = useId();
  const [formulario, setFormulario] = useState(formularioInicial);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [erroAoSalvar, setErroAoSalvar] = useState("");

  const erros = tentouSalvar ? validarTarefa(formulario) : {};
  const idTitulo = `${id}-titulo`;
  const idErro = (campo: keyof FormularioTarefa) => `${id}-${campo}-erro`;

  function alterar(campo: keyof FormularioTarefa, valor: string){
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function abrir(){
    setFormulario(tarefa ? paraFormulario(tarefa) : formularioInicial);
    setTentouSalvar(false);
    setErroAoSalvar("");
    modal.current?.showModal();
    campoTitulo.current?.focus();
  }

  function salvar(evento: FormEvent<HTMLFormElement>){
    evento.preventDefault();
    setTentouSalvar(true);

    const errosAtuais = validarTarefa(formulario);
    if(Object.keys(errosAtuais).length > 0){
      if(errosAtuais.titulo) campoTitulo.current?.focus();
      return;
    }

    try{
      if(tarefa) substituirTarefa(editarTarefa(tarefa, formulario, Date.now()));
      else adicionarTarefa(criarTarefa(formulario, Date.now()));
      modal.current?.close();
    } catch{
      setErroAoSalvar("Não foi possível salvar a tarefa no navegador.");
    }
  }

  return (
    <>
      <button type="button" aria-label={rotuloAcessivel} onClick={abrir} className={className}>
        {children}
      </button>

      <dialog
        ref={modal}
        aria-labelledby={idTitulo}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface backdrop:bg-surface-container-lowest/80 backdrop:backdrop-blur-sm"
      >
        <form noValidate onSubmit={salvar} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 id={idTitulo} className="text-base font-semibold">
              {tarefa ? "Editar Tarefa" : "Nova Tarefa"}
            </h3>
            <button
              type="button"
              aria-label="Fechar"
              title="Fechar"
              onClick={() => modal.current?.close()}
              className="text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-on-surface-variant">
              Título · {limitesTitulo.min} a {limitesTitulo.max} caracteres
            </span>
            <input
              ref={campoTitulo}
              type="text"
              maxLength={limitesTitulo.max}
              placeholder="Ex: Resolver a lista de exercícios"
              value={formulario.titulo}
              onChange={(e) => alterar("titulo", e.target.value)}
              aria-invalid={erros.titulo ? true : undefined}
              aria-describedby={erros.titulo ? idErro("titulo") : undefined}
              className={`${estiloCampo} ${erros.titulo ? "border-error" : "border-outline-variant/70"}`}
            />
            {erros.titulo && (
              <span id={idErro("titulo")} className="text-[11px] text-error">
                {erros.titulo}
              </span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {camposSelecao.map(({ campo, rotulo, opcoes }) => (
              <label key={campo} className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-on-surface-variant">{rotulo}</span>
                <select
                  value={formulario[campo]}
                  onChange={(e) => alterar(campo, e.target.value)}
                  aria-invalid={erros[campo] ? true : undefined}
                  aria-describedby={erros[campo] ? idErro(campo) : undefined}
                  className={`${estiloCampo} scheme-dark ${erros[campo] ? "border-error" : "border-outline-variant/70"}`}
                >
                  {opcoes.map(({ valor, nome }) => (
                    <option key={valor} value={valor}>
                      {nome}
                    </option>
                  ))}
                </select>
                {erros[campo] && (
                  <span id={idErro(campo)} className="text-[11px] text-error">
                    {erros[campo]}
                  </span>
                )}
              </label>
            ))}
          </div>

          {erroAoSalvar && (
            <p role="alert" className="text-xs text-error">
              {erroAoSalvar}
            </p>
          )}

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
              Salvar Tarefa
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
