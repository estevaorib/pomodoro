import Guia from "@/components/Guia";
import ListaTarefas from "@/components/ListaTarefas";
import Presets from "@/components/Presets";
import Timer from "@/components/Timer";

export default function Home(){
  return (
    <main className="flex w-full flex-1 pt-16 max-lg:flex-col">
      <div className="flex-1">
        <Timer />
      </div>
      <ListaTarefas />
      <Presets />
      <Guia />
    </main>
  );
}
