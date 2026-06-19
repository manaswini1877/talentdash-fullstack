import Link from 'next/link';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  basePath?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  basePath = '/salaries',
  searchParams = {},
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === 'page') return;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    });
    params.set('page', String(nextPage));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-metadata text-muted-text">
        Showing {start}–{end} of {total} records
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-label text-body-text transition-colors hover:bg-hover-surface"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-lg border border-border bg-app-bg px-4 py-2 text-label text-muted-text">
            Previous
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-label text-body-text transition-colors hover:bg-hover-surface"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-lg border border-border bg-app-bg px-4 py-2 text-label text-muted-text">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
