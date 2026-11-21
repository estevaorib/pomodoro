# Pomodoro

Aplicação web de gestão de foco baseada na técnica Pomodoro, para estudantes organizarem ciclos de estudo. Permite criar temporizadores personalizados, executar sessões de foco/pausa com retomada automática após reabrir o navegador, e gerenciar um painel lateral de tarefas. Todos os dados ficam salvos apenas no próprio navegador (Local Storage); não há backend, login ou sincronização entre dispositivos.

**Equipe:** Estevão Ribeiro, Sarah Emanuelle, Tainara Ribeiro.

## Tecnologias

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/), com [Vite](https://vite.dev/) como bundler e servidor de desenvolvimento
- [Tailwind CSS v4](https://tailwindcss.com/) para estilos
- Local Storage do navegador como única camada de persistência
- Web Audio API para o alerta sonoro de fim de fase (sem arquivos de áudio)

## Como executar

Pré-requisitos: [Node.js](https://nodejs.org/) 20.9 ou superior.

```bash
npm install
npm run dev
```

Abra o endereço impresso no terminal (por padrão [http://localhost:5173](http://localhost:5173)) no navegador.

Outros scripts disponíveis:

```bash
npm run build     # build de produção (gera a pasta dist/, estática)
npm run preview   # serve o build de produção localmente, para testar antes de publicar
npm run lint      # ESLint
```

A aplicação é inteiramente client-side e compila para arquivos estáticos (HTML/CSS/JS em `dist/`): qualquer navegador moderno com suporte a Local Storage e Web Audio API é suficiente para rodá-la, e qualquer servidor de arquivos estáticos é suficiente para hospedá-la — sem variáveis de ambiente, backend ou serviços externos a configurar.

## Decisões técnicas

- **Sessão ativa com timestamps absolutos, não contadores de intervalo.** O fim de cada fase é guardado como instante absoluto (`fimFasePrevistoEm`). A cada tick, e ao reabrir a aplicação, o estado é recalculado comparando `Date.now()` com esse instante, avançando por quantas fases forem necessárias até encontrar a fase vigente ou concluir a sessão. Isso evita perda de progresso quando o navegador suspende timers em abas inativas ou fica fechado por um tempo.
- **Snapshot do preset ao iniciar a sessão.** A sessão ativa guarda uma cópia (`snapshotPreset`) dos parâmetros do preset no momento em que foi iniciada, para que edições posteriores no preset não afetem uma sessão já em andamento.
- **Estado compartilhado via `useSyncExternalStore`, sem Context/Redux.** Sessão, presets e tarefas vivem em módulos próprios (`hooks/useSessao.ts`, `usePresets.ts`, `useTarefas.ts`) com o Local Storage como fonte da verdade; os componentes se inscrevem via `useSyncExternalStore`. Evita prop drilling e mantém a UI sempre consistente com o que está persistido.
- **Validação defensiva na leitura do Local Storage.** Cada chave lida é validada por tipo e formato antes de ser aceita. Dados corrompidos ou ilegíveis não são descartados silenciosamente: ficam preservados no armazenamento e a interface oferece ao usuário a opção explícita de descartá-los, nunca descarta por conta própria.
- **Alerta sonoro gerado via Web Audio API.** O beep de fim de fase é sintetizado por oscilador, sem depender de arquivo de áudio. O contexto de áudio só é criado/retomado a partir de uma interação do usuário (iniciar/retomar a sessão), respeitando as políticas de autoplay dos navegadores.
- **Separação em camadas.** `src/lib/` concentra regras de domínio e persistência, puras e sem React; `src/hooks/` expõe esse domínio ao React; `src/components/` cuida apenas de apresentação.
- **Tailwind CSS v4** para estilização, com paleta de cores definida em `src/index.css`, e painel lateral responsivo: overlay sobreposto em telas menores, coluna fixa ao lado do temporizador em desktop.
- **Confirmação explícita em toda ação destrutiva** (excluir preset, excluir tarefa, encerrar sessão, reiniciar ciclos, descartar sessão/dados corrompidos), via modal de confirmação reutilizável.

## Persistência

Os dados são salvos em três chaves do `localStorage`, sempre como JSON:

| Chave | Conteúdo |
|---|---|
| `pomodoro.presets` | Lista de temporizadores personalizados |
| `pomodoro.tarefas` | Lista de tarefas do painel lateral |
| `pomodoro.sessaoAtiva` | Sessão de foco em andamento (ausente quando não há sessão ativa) |

## Estrutura do projeto

```
index.html          ponto de entrada HTML (Vite)
src/
  main.tsx           bootstrap do React
  App.tsx            composição da página (header, temporizador, painéis, footer)
  index.css          Tailwind + paleta de cores + estilos globais
  components/        componentes de interface (React)
  hooks/             estado da aplicação exposto ao React (sessão, presets, tarefas)
  lib/               domínio e persistência: modelos, validações, regras de negócio
```
