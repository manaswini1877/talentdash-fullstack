import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-h3 font-bold text-accent">TalentDash</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/salaries"
            className="text-label text-body-text transition-colors hover:text-deep-text"
          >
            Salaries
          </Link>
          <Link
            href="/compare"
            className="text-label text-body-text transition-colors hover:text-deep-text"
          >
            Compare
          </Link>
        </nav>
      </div>
    </header>
  );
}
