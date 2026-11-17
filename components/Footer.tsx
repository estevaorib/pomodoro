export default async function Footer() {
  "use cache";

  return (
    <footer className="w-full border-t border-outline-variant/60 bg-surface py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 font-mono text-xs text-on-surface-variant max-sm:flex-col">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(90,240,179,0.5)]" />
          <span className="font-semibold text-on-surface">pomodoro</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] max-sm:flex-col max-sm:gap-1">
          <span>Estevão Ribeiro & Sarah Emanuelle & Tainara Ribeiro</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
