"use client";

import { useState } from "react";
import {
  descartarSessaoRestaurada,
  manterSessaoRestaurada,
  useSessaoAtual,
  useSessaoRestaurada,
} from "@/hooks/useSessao";
import { nomesFase } from "@/lib/sessao";
import AvisoSessao, { estiloBotaoAviso } from "./AvisoSessao";
import BotaoConfirmacao from "./BotaoConfirmacao";
import { ID_BOTAO_PRINCIPAL_TIMER } from "./Timer";

function focarTimer(){
  document.getElementById(ID_BOTAO_PRINCIPAL_TIMER)?.focus();
}

export default function AvisoSessaoRestaurada(){
  const restaurada = useSessaoRestaurada();
  const sessao = useSessaoAtual();
  const [erro, setErro] = useState("");

  if(!restaurada || !sessao) return null;

  const { snapshotPreset: preset } = sessao;
  const contexto = `${preset.nome} • ${nomesFase[sessao.faseAtual]} • ciclo ${sessao.cicloAtual} de ${preset.ciclosAntesPausaLonga}${sessao.status === "pausada" ? " (pausada)" : ""}`;

  function manter(){
    manterSessaoRestaurada();
    focarTimer();
  }

  function descartar(){
    try{
      descartarSessaoRestaurada();
      setErro("");
      focarTimer();
    } catch{
      setErro("Não foi possível descartar a sessão no navegador.");
    }
  }

  return (
    <AvisoSessao
      tom="info"
      role="status"
      erro={erro}
      acoes={
        <>
          <button type="button" onClick={manter} className={estiloBotaoAviso.principal}>
            Manter
          </button>
          <BotaoConfirmacao
            titulo="Descartar sessão restaurada?"
            mensagem="A sessão será encerrada sem contabilizar o progresso."
            rotuloConfirmar="Descartar"
            rotuloCancelar="Manter sessão"
            onConfirmar={descartar}
            className={estiloBotaoAviso.secundario}
          >
            Descartar
          </BotaoConfirmacao>
        </>
      }
    >
      <p className="text-xs font-medium text-on-surface">Sessão anterior restaurada.</p>
      <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">{contexto}</p>
    </AvisoSessao>
  );
}
