import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-h1">404</h1>
      <p className="mt-4 text-body text-body-text">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-accent px-6 py-3 text-label font-medium text-white transition-opacity hover:opacity-90"
      >
        Go Home
      </Link>
    </div>
  );
}
