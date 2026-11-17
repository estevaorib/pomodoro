import Presets from "@/components/Presets";
import Timer from "@/components/Timer";

export default function Home(){
  return (
    <main className="flex w-full flex-1 flex-col items-center pt-16">
      <Timer />
      <div className="w-full max-w-4xl px-6 pb-24 max-sm:px-4">
        <Presets />
      </div>
    </main>
  );
}
