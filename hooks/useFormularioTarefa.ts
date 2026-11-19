import { useState } from "react";
import {
  criarTarefa,
  editarTarefa,
  paraFormulario,
  validarTarefa,
  valoresPadraoTarefa,
  type ErrosTarefa,
  type FormularioTarefa,
  type Tarefa,
} from "@/lib/tarefa";
import { adicionarTarefa, substituirTarefa } from "./useTarefas";

const formularioInicial: FormularioTarefa = paraFormulario(valoresPadraoTarefa);

export function useFormularioTarefa(tarefa?: Tarefa){
  const [formulario, setFormulario] = useState(formularioInicial);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [alterados, setAlterados] = useState<Partial<Record<keyof FormularioTarefa, boolean>>>({});
  const [erroAoSalvar, setErroAoSalvar] = useState("");

  const errosValidacao = validarTarefa(formulario);
  const invalido = Object.keys(errosValidacao).length > 0;
  const erros: ErrosTarefa = {};
  for(const campo of Object.keys(errosValidacao) as (keyof FormularioTarefa)[]){
    if(tentouSalvar || alterados[campo]) erros[campo] = errosValidacao[campo];
  }

  function alterar(campo: keyof FormularioTarefa, valor: string){
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    setAlterados((atual) => ({ ...atual, [campo]: true }));
  }

  function reiniciar(){
    setFormulario(tarefa ? paraFormulario(tarefa) : formularioInicial);
    setTentouSalvar(false);
    setAlterados({});
    setErroAoSalvar("");
  }

  function salvar(){
    setTentouSalvar(true);
    if(invalido) return false;

    try{
      if(tarefa) substituirTarefa(editarTarefa(tarefa, formulario, Date.now()));
      else adicionarTarefa(criarTarefa(formulario, Date.now()));
      return true;
    } catch{
      setErroAoSalvar("Não foi possível salvar a tarefa no navegador.");
      return false;
    }
  }

  return { formulario, erros, errosValidacao, invalido, erroAoSalvar, alterar, reiniciar, salvar };
}
