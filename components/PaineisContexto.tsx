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

export type NomePainel = "tarefas" | "presets" | "guia";

export function idPainel(nome: NomePainel){
  return `painel-${nome}`;
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

  // Todos os painéis começam fechados e só um fica aberto por vez, dividindo a coluna da direita.
  // A escolha vale para o tamanho de tela em que foi feita: ao cruzar o breakpoint, tudo volta a fechar.
  const aberto = escolha && escolha.desktop === desktop ? escolha.painel : null;

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

export function BotaoPainel({ nome, className, children }: { nome: NomePainel; className: string; children: ReactNode }){
  const { aberto, alternar } = usePaineis();

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
