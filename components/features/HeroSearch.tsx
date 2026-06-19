'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/salaries?company=${encodeURIComponent(query.trim())}`);
    }
  };

  const popularTags = [
    { label: 'Google L4', href: '/salaries?company=Google&level=L4' },
    { label: 'Amazon SDE-II', href: '/salaries?company=Amazon&level=SDE_II' },
    { label: 'Bengaluru', href: '/salaries?location=Bengaluru' },
    { label: '₹50L+', href: '/salaries?sort=total_comp_desc' },
    { label: 'Remote', href: '/salaries?location=Remote' },
  ];

  return (
    <div className="mt-8 max-w-xl">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-muted-text"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or role..."
          className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-body text-deep-text placeholder:text-muted-text shadow-sm outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          className="absolute right-2.5 rounded-lg bg-accent px-4 py-1.5 text-label font-medium text-white transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-metadata text-muted-text">Popular:</span>
        {popularTags.map((tag) => (
          <Link
            key={tag.label}
            href={tag.href}
            className="rounded-full border border-border bg-surface px-3 py-1 text-metadata font-medium text-body-text transition-all hover:border-accent hover:bg-accent hover:text-white"
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
