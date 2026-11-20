"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { idPainel, idTituloPainel, usePaineis, type NomePainel } from "./PaineisContexto";

export const recuoLateral = "px-5 max-lg:px-6 max-sm:px-4";

const estiloPainel = {
  aberto:
    "lg:w-88 lg:border-l max-lg:visible max-lg:translate-x-0 motion-safe:max-lg:[transition:translate_300ms_ease-out,visibility_0s]",
  fechado:
    "lg:w-0 lg:border-l-0 max-lg:invisible max-lg:translate-x-full motion-safe:max-lg:[transition:translate_300ms_ease-out,visibility_0s_300ms]",
};

const estiloFundo = {
  aberto: "visible opacity-100 motion-safe:[transition:opacity_300ms_ease-out,visibility_0s]",
  fechado: "invisible opacity-0 motion-safe:[transition:opacity_300ms_ease-out,visibility_0s_300ms]",
};

type PropsCabecalho = {
  nome: NomePainel;
  sobretitulo: string;
  titulo: string;
  complemento?: ReactNode;
  refTitulo?: RefObject<HTMLHeadingElement | null>;
};

export function CabecalhoPainel({ nome, sobretitulo, titulo, complemento, refTitulo }: PropsCabecalho){
  return (
    <div className="min-w-0">
      <span className="font-mono text-[11px] font-semibold tracking-widest text-primary uppercase">{sobretitulo}</span>
      <div className="mt-0.5 flex items-center gap-2">
        <h2
          id={idTituloPainel(nome)}
          ref={refTitulo}
          tabIndex={refTitulo ? -1 : undefined}
          className="text-xl font-semibold tracking-tight text-on-surface"
        >
          {titulo}
        </h2>
        {complemento}
      </div>
    </div>
  );
}

type Props = PropsCabecalho & {
  rotuloFechar: string;
  somenteDesktop?: boolean;
  children: ReactNode;
};

export default function PainelLateral({ rotuloFechar, somenteDesktop = false, children, ...cabecalho }: Props){
  const { nome } = cabecalho;
  const { aberto: painelAberto, desktop, fechar, origem } = usePaineis();
  const painel = useRef<HTMLElement>(null);
  const botaoFechar = useRef<HTMLButtonElement>(null);

  const aberto = painelAberto === nome;
  const sobreposicao = !desktop && aberto;
  const id = idPainel(nome);

  useEffect(() => {
    const elemento = painel.current;
    const botaoOrigem = origem.current;
    if(!sobreposicao || !elemento) return;


    const inertes: Element[] = [];
    for(let atual: Element = elemento; atual !== document.body && atual.parentElement; atual = atual.parentElement){
      for(const irmao of Array.from(atual.parentElement.children)){
        if(irmao === atual || irmao.hasAttribute("inert") || irmao.hasAttribute("data-fundo-painel")) continue;
        irmao.setAttribute("inert", "");
        inertes.push(irmao);
      }
    }

    const rolagemAnterior = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    botaoFechar.current?.focus();

    function aoTeclar(evento: KeyboardEvent){
      if(evento.key !== "Escape" || elemento?.querySelector("dialog[open]")) return;
      evento.preventDefault();
      fechar();
    }

    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      inertes.forEach((irmao) => irmao.removeAttribute("inert"));
      document.documentElement.style.overflow = rolagemAnterior;
      if(botaoOrigem?.isConnected) botaoOrigem.focus();
    };
  }, [sobreposicao, fechar, origem]);

  function fecharPainel(){
    fechar();
    if(origem.current?.isConnected) origem.current.focus();
  }

  return (
    <>
      {!somenteDesktop && (
        <div
          aria-hidden="true"
          data-fundo-painel=""
          onClick={fechar}
          className={`fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-sm lg:hidden ${estiloFundo[aberto ? "aberto" : "fechado"]}`}
        />
      )}

      <aside
        ref={painel}
        id={id}
        aria-labelledby={idTituloPainel(nome)}
        role={sobreposicao ? "dialog" : undefined}
        aria-modal={sobreposicao ? true : undefined}
        inert={!aberto}
        className={`h-[calc(100vh-4rem)] shrink-0 overflow-hidden border-outline-variant/60 bg-surface motion-safe:lg:transition-[width] motion-safe:lg:duration-300 motion-safe:lg:ease-out max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-60 max-lg:h-auto max-lg:w-88 max-lg:max-w-[calc(100vw-3rem)] max-lg:border-l ${estiloPainel[aberto ? "aberto" : "fechado"]} ${somenteDesktop ? "max-lg:hidden" : ""}`}
      >
        <div className="flex h-full w-88 flex-col max-lg:w-full">
          <div className={`flex items-start justify-between gap-3 pt-10 pb-4 ${recuoLateral}`}>
            <CabecalhoPainel {...cabecalho} />

            <button
              ref={botaoFechar}
              type="button"
              aria-label={rotuloFechar}
              title="Fechar painel"
              onClick={fecharPainel}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {children}
        </div>
      </aside>
    </>
  );
}
