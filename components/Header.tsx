const links = [
  { href: "#temporizador", label: "Temporizador" },
  { href: "#tarefas", label: "Tarefas" },
  { href: "#presets", label: "Presets" },
  { href: "#guia", label: "Guia" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-outline-variant/60 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#" className="group flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(90,240,179,0.5)] transition-transform duration-300 group-hover:scale-125" />
          <span className="text-sm font-semibold tracking-tight text-on-surface">pomodoro</span>
        </a>

        <nav className="flex items-center gap-6 text-xs font-medium text-on-surface-variant max-md:hidden">
          {links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-primary ${i === 0 ? "font-semibold text-on-surface" : ""}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            title="Novo preset"
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <svg viewBox="0 0 24 24" className="size-4.5 fill-current">
              <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
