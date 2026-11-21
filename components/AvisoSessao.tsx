import type { ReactNode } from "react";

// Base visual dos avisos exibidos acima do temporizador (sessão restaurada, sessão corrompida).
type Tom = "erro" | "info";

const estiloCaixa: Record<Tom, string> = {
  erro: "border-error/40 bg-error-container/15",
  info: "border-primary/30 bg-surface-container",
};

export const estiloBotaoAviso = {
  erro: "shrink-0 rounded-lg border border-error/40 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error-container/20",
  principal:
    "shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-container",
  secundario:
    "shrink-0 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-high",
};

type Props = {
  tom: Tom;
  role: "alert" | "status";
  acoes: ReactNode;
  // Erro da ação (ex.: falha ao remover do localStorage), anunciado com role="alert".
  erro?: string;
  children: ReactNode;
};

export default function AvisoSessao({ tom, role, acoes, erro, children }: Props){
  return (
    <div className="flex flex-col gap-2 px-6 pt-6 max-sm:px-4">
      <div
        role={role}
        className={`mx-auto flex w-full max-w-xl items-center gap-3 rounded-xl border p-3 max-sm:flex-col max-sm:items-start ${estiloCaixa[tom]}`}
      >
        <div className="min-w-0 flex-1 break-words">{children}</div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">{acoes}</div>
      </div>

      {erro && (
        <p role="alert" className="mx-auto w-full max-w-xl text-xs text-error">
          {erro}
        </p>
      )}
    </div>
  );
}
