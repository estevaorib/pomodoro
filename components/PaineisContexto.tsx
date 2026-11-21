"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";

export type NomePainel = "tarefas" | "presets";

export function idPainel(nome: NomePainel){
  return `painel-${nome}`;
}

export function idTituloPainel(nome: NomePainel){
  return `titulo-${idPainel(nome)}`;
}

const CONSULTA_DESKTOP = "(min-width: 64rem)";

type Escolha = { painel: NomePainel | null; desktop: boolean };

type ValorPaineis = {
  aberto: NomePainel | null;
  desktop: boolean;
  alternar: (nome: NomePainel, origem: HTMLElement) => void;
  fechar: () => void;
  origem: RefObject<HTMLElement | null>;
};

const Paineis = createContext<ValorPaineis | null>(null);

function assinarTela(ouvinte: () => void){
  const consulta = window.matchMedia(CONSULTA_DESKTOP);
  consulta.addEventListener("change", ouvinte);
  return () => consulta.removeEventListener("change", ouvinte);
}

function telaDesktop(){
  return window.matchMedia(CONSULTA_DESKTOP).matches;
}

export function PaineisProvider({ children }: { children: ReactNode }){
  const desktop = useSyncExternalStore(assinarTela, telaDesktop, () => true);
  const [escolha, setEscolha] = useState<Escolha | null>(null);
  const origem = useRef<HTMLElement>(null);
  const aberto = escolha && escolha.desktop === desktop ? escolha.painel : desktop ? "tarefas" : null;

  const alternar = useCallback(
    (nome: NomePainel, elemento: HTMLElement) => {
      origem.current = elemento;
      setEscolha({ painel: aberto === nome ? null : nome, desktop });
    },
    [aberto, desktop],
  );

  const fechar = useCallback(() => setEscolha({ painel: null, desktop }), [desktop]);

  return <Paineis value={{ aberto, desktop, alternar, fechar, origem }}>{children}</Paineis>;
}

export function usePaineis(){
  const paineis = useContext(Paineis);
  if(!paineis) throw new Error("usePaineis precisa estar dentro de PaineisProvider.");
  return paineis;
}

function rolarParaTarefas(){
  document.getElementById(idPainel("tarefas"))?.scrollIntoView({ block: "start" });
  document.getElementById(idTituloPainel("tarefas"))?.focus({ preventScroll: true });
}

export function BotaoPainel({ nome, className, children }: { nome: NomePainel; className: string; children: ReactNode }){
  const { aberto, desktop, alternar } = usePaineis();

  // Abaixo de lg as tarefas ficam no fluxo da página, abaixo do temporizador: o botão rola até elas.
  if(nome === "tarefas" && !desktop){
    return (
      <button type="button" onClick={rolarParaTarefas} className={className}>
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-expanded={aberto === nome}
      aria-controls={idPainel(nome)}
      onClick={(evento) => alternar(nome, evento.currentTarget)}
      className={className}
    >
      {children}
    </button>
  );
}
