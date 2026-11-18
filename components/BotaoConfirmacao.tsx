"use client";

import { useId, useRef, type ReactNode } from "react";

type Props = {
  titulo: string;
  mensagem: string;
  rotuloConfirmar: string;
  onConfirmar: () => void;
  title?: string;
  rotuloAcessivel?: string;
  className: string;
  children: ReactNode;
};

export default function BotaoConfirmacao({
  titulo,
  mensagem,
  rotuloConfirmar,
  onConfirmar,
  title,
  rotuloAcessivel,
  className,
  children,
}: Props){
  const modal = useRef<HTMLDialogElement>(null);
  const id = useId();

  function confirmar(){
    modal.current?.close();
    onConfirmar();
  }

  return (
    <>
      <button
        type="button"
        title={title}
        aria-label={rotuloAcessivel}
        onClick={() => modal.current?.showModal()}
        className={className}
      >
        {children}
      </button>

      <dialog
        ref={modal}
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-mensagem`}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface backdrop:bg-surface-container-lowest/80 backdrop:backdrop-blur-sm"
      >
        <h3 id={`${id}-titulo`} className="text-base font-semibold">
          {titulo}
        </h3>
        <p id={`${id}-mensagem`} className="mt-3 text-xs leading-relaxed break-words text-on-surface-variant">
          {mensagem}
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => modal.current?.close()}
            className="rounded-lg px-3.5 py-1.5 text-xs text-on-surface transition-colors hover:bg-surface-container-low"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            className="rounded-lg bg-error px-4 py-1.5 text-xs font-medium text-on-error transition-colors hover:bg-error/85"
          >
            {rotuloConfirmar}
          </button>
        </div>
      </dialog>
    </>
  );
}
