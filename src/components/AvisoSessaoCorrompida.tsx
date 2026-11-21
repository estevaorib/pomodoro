import { useState } from "react";
import { descartarSessaoCorrompida, useSessaoCorrompida } from "@/hooks/useSessao";
import AvisoSessao, { estiloBotaoAviso } from "./AvisoSessao";
import BotaoConfirmacao from "./BotaoConfirmacao";

export default function AvisoSessaoCorrompida(){
  const corrompida = useSessaoCorrompida();
  const [erro, setErro] = useState("");

  if(!corrompida) return null;

  function descartar(){
    try{
      descartarSessaoCorrompida();
      setErro("");
    } catch{
      setErro("Não foi possível descartar a sessão salva no navegador.");
    }
  }

  return (
    <AvisoSessao
      tom="erro"
      role="alert"
      erro={erro}
      acoes={
        <BotaoConfirmacao
          titulo="Descartar sessão salva?"
          mensagem="Os dados inválidos da sessão salva serão apagados permanentemente deste navegador."
          rotuloConfirmar="Descartar"
          onConfirmar={descartar}
          className={estiloBotaoAviso.erro}
        >
          Descartar
        </BotaoConfirmacao>
      }
    >
      <p className="text-xs text-error">Não foi possível restaurar a sessão anterior: os dados salvos estão inválidos.</p>
    </AvisoSessao>
  );
}
