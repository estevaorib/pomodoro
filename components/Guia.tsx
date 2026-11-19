import PainelLateral, { recuoLateral } from "./PainelLateral";

export default function Guia(){
  return (
    <PainelLateral nome="guia" sobretitulo="Ajuda" titulo="Guia" rotuloFechar="Fechar guia">
      <div className={`min-h-0 flex-1 overflow-y-auto pb-6 ${recuoLateral}`}>
        {/* Conteúdo provisório: o texto do guia será escrito depois. */}
        <p className="rounded-xl border border-dashed border-outline-variant/70 p-6 text-center text-xs text-on-surface-variant">
          O conteúdo do guia ainda está sendo escrito.
        </p>
      </div>
    </PainelLateral>
  );
}
