export function AppLayout({
  filters,
  sidebar,
  children,
}: {
  filters: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-neutral-900 text-neutral-200 antialiased selection:bg-indigo-500/30 overflow-hidden">
      {/* Main layout container with full viewport constraints */}
      <div className="mx-auto max-w-7xl h-full p-6 flex flex-col space-y-5">
        {/* Filters Header */}
        <header className="flex-shrink-0 rounded-xl border border-neutral-700/40 bg-neutral-800/40 p-4 backdrop-blur-md shadow-sm">
          {filters}
        </header>

        {/* Main Split Grid */}
        <div className="flex-1 grid gap-5 lg:grid-cols-[280px_1fr] min-h-0">
          {/* Sidebar*/}
          <aside className="rounded-xl border border-neutral-700/30 bg-neutral-800/20 p-5 overflow-y-auto min-h-0 custom-scrollbar">
            {sidebar}
          </aside>

          {/* Main Content Area */}
          <main className="rounded-xl border border-neutral-700/40 bg-neutral-800/30 p-6 shadow-sm overflow-y-auto min-h-0 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
