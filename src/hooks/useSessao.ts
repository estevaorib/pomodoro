import { useEffect, useState, useSyncExternalStore } from "react";
import { prepararAudio, tocarAlerta } from "@/lib/alerta";
import { descartarSessaoSalva, gravarSessao, lerSessao } from "@/lib/armazenamento";
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
// Dado salvo ilegível: fica preservado no localStorage até ser descartado ou sobrescrito por uma sessão nova.
let sessaoCorrompida = false;
// Sessão ativa retomada do localStorage ao abrir a página, ainda sem resposta do usuário (RF-13).
// Exclusiva com `sessaoCorrompida`: as duas vêm da mesma leitura.
let sessaoRestaurada = false;
const ouvintes = new Set<() => void>();

function notificar(){
  ouvintes.forEach((ouvinte) => ouvinte());
}

function obterSessao(){
  if(!carregada){
    carregada = true;
    const leitura = lerSessao();
    if(leitura.tipo === "valida"){
      sessaoAtual = sincronizar(leitura.sessao, Date.now()).sessao;
      gravarSessao(sessaoAtual);
      // Sessão que terminou inteira com a página fechada (RN-08) não é oferecida para retomar.
      sessaoRestaurada = sessaoAtual.status !== "concluida";
    } else if(leitura.tipo === "corrompida"){
      sessaoCorrompida = true;
    }
  }
  return sessaoAtual;
}

function obterSessaoCorrompida(){
  obterSessao();
  return sessaoCorrompida;
}

function obterSessaoRestaurada(){
  obterSessao();
  return sessaoRestaurada;
}

function definirSessao(sessao: SessaoAtiva | null){
  // Encerrar, iniciar outra ou concluir tiram o banner; pausar, retomar e pular fase (mesmo id) não.
  if(!sessao || sessao.id !== sessaoAtual?.id || sessao.status === "concluida") sessaoRestaurada = false;
  sessaoAtual = sessao;
  gravarSessao(sessao);
  // Depois de gravar (ou remover), a chave não guarda mais o dado corrompido.
  sessaoCorrompida = false;
  notificar();
}

export function manterSessaoRestaurada(){
  sessaoRestaurada = false;
  notificar();
}

// Remove primeiro do localStorage: se falhar, o erro propaga e a sessão continua intacta na memória.
export function descartarSessaoRestaurada(){
  descartarSessaoSalva();
  sessaoAtual = null;
  sessaoRestaurada = false;
  notificar();
}

export function descartarSessaoCorrompida(){
  descartarSessaoSalva();
  sessaoCorrompida = false;
  notificar();
}

function assinar(ouvinte: () => void){
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function iniciarComPreset(preset: Preset){
  prepararAudio();
  definirSessao(iniciarSessao(preset, Date.now()));
}

export function useSessaoAtual(){
  return useSyncExternalStore(assinar, obterSessao, () => null);
}

export function useSessaoCorrompida(){
  return useSyncExternalStore(assinar, obterSessaoCorrompida, () => false);
}

export function useSessaoRestaurada(){
  return useSyncExternalStore(assinar, obterSessaoRestaurada, () => false);
}

export function useSessao(){
  const sessao = useSessaoAtual();
  const [agora, setAgora] = useState(0);
  const emAndamento = sessao?.status === "emAndamento";

  useEffect(() => {
    if(!emAndamento) return;

    function atualizar(){
      const instante = Date.now();
      const atual = obterSessao();

      if(atual){
        const { sessao: proxima, fasesConcluidas } = sincronizar(atual, instante);
        if(fasesConcluidas > 0){
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

  function aplicar(acao: (sessao: SessaoAtiva, instante: number) => SessaoAtiva){
    const atual = obterSessao();
    if(!atual) return;

    const instante = Date.now();
    definirSessao(acao(atual, instante));
    setAgora(instante);
  }

  return {
    sessao,
    agora,
    iniciar(preset: Preset){
      iniciarComPreset(preset);
      setAgora(Date.now());
    },
    pausar: () => aplicar(pausarSessao),
    retomar(){
      prepararAudio();
      aplicar(retomarSessao);
    },
    pularFase: () => aplicar(pularFase),
    reiniciarCiclos: () => aplicar(reiniciarCiclos),
    encerrar: () => definirSessao(null),
  };
}
