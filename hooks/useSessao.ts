import { useEffect, useState, useSyncExternalStore } from "react";
import { prepararAudio, tocarAlerta } from "@/lib/alerta";
import { gravarSessao, lerSessao } from "@/lib/armazenamento";
import type { Preset } from "@/lib/preset";
import {
  iniciarSessao,
  pausarSessao,
  pularFase,
  reiniciarCiclos,
  retomarSessao,
  sincronizar,
  type SessaoAtiva,
} from "@/lib/sessao";

let sessaoAtual: SessaoAtiva | null = null;
let carregada = false;
const ouvintes = new Set<() => void>();

function obterSessao() {
  if (!carregada) {
    carregada = true;
    const salva = lerSessao();
    if (salva) {
      sessaoAtual = sincronizar(salva, Date.now()).sessao;
      gravarSessao(sessaoAtual);
    }
  }
  return sessaoAtual;
}

function definirSessao(sessao: SessaoAtiva | null) {
  sessaoAtual = sessao;
  gravarSessao(sessao);
  ouvintes.forEach((ouvinte) => ouvinte());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function useSessao() {
  const sessao = useSyncExternalStore(assinar, obterSessao, () => null);
  const [agora, setAgora] = useState(0);
  const emAndamento = sessao?.status === "emAndamento";

  useEffect(() => {
    if (!emAndamento) return;

    function atualizar() {
      const instante = Date.now();
      const atual = obterSessao();

      if (atual) {
        const { sessao: proxima, fasesConcluidas } = sincronizar(atual, instante);
        if (fasesConcluidas > 0) {
          definirSessao(proxima);
          tocarAlerta();
        }
      }

      setAgora(instante);
    }

    const primeiro = setTimeout(atualizar, 0);
    const intervalo = setInterval(atualizar, 250);

    return () => {
      clearTimeout(primeiro);
      clearInterval(intervalo);
    };
  }, [emAndamento]);

  function aplicar(acao: (sessao: SessaoAtiva, instante: number) => SessaoAtiva) {
    const atual = obterSessao();
    if (!atual) return;

    const instante = Date.now();
    definirSessao(acao(atual, instante));
    setAgora(instante);
  }

  return {
    sessao,
    agora,
    iniciar(preset: Preset) {
      prepararAudio();
      const instante = Date.now();
      definirSessao(iniciarSessao(preset, instante));
      setAgora(instante);
    },
    pausar: () => aplicar(pausarSessao),
    retomar() {
      prepararAudio();
      aplicar(retomarSessao);
    },
    pularFase: () => aplicar(pularFase),
    reiniciarCiclos: () => aplicar(reiniciarCiclos),
    encerrar: () => definirSessao(null),
  };
}
