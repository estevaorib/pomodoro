"use client";

import { useState } from "react";
import { descartarSessaoCorrompida, useSessaoCorrompida } from "@/hooks/useSessao";
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
    <div className="flex flex-col gap-2 px-6 pt-6 max-sm:px-4">
      <div
        role="alert"
        className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-xl border border-error/40 bg-error-container/15 p-3 max-sm:flex-col max-sm:items-start"
      >
        <p className="flex-1 text-xs text-error">
          Não foi possível restaurar a sessão anterior: os dados salvos estão inválidos.
        </p>
        <BotaoConfirmacao
          titulo="Descartar sessão salva?"
          mensagem="Os dados inválidos da sessão salva serão apagados permanentemente deste navegador."
          rotuloConfirmar="Descartar"
          onConfirmar={descartar}
          className="shrink-0 rounded-lg border border-error/40 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error-container/20"
        >
          Descartar
        </BotaoConfirmacao>
      </div>

      {erro && (
        <p role="alert" className="mx-auto w-full max-w-xl text-xs text-error">
          {erro}
        </p>
      )}
    </div>
  );
}
