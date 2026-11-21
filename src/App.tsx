import AvisoSessaoCorrompida from "./components/AvisoSessaoCorrompida";
import AvisoSessaoRestaurada from "./components/AvisoSessaoRestaurada";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ListaTarefas from "./components/ListaTarefas";
import { PaineisProvider } from "./components/PaineisContexto";
import Presets from "./components/Presets";
import Timer from "./components/Timer";

export default function App(){
  return (
    <PaineisProvider>
      <Header />
      <main className="flex w-full flex-1 pt-16 max-lg:flex-col">
        <div className="flex-1">
          <AvisoSessaoCorrompida />
          <AvisoSessaoRestaurada />
          <Timer />
        </div>
        <ListaTarefas />
        <Presets />
      </main>
      <Footer />
    </PaineisProvider>
  );
}
