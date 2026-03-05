import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050301] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-[#D4A84F] text-sm uppercase tracking-[0.4em] mb-4">404</p>
        <h1 className="text-4xl font-serif text-white mb-3">Page not found</h1>
        <p className="text-white/50 mb-8 text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/my-account"
            className="px-5 py-2.5 rounded-lg bg-[#D4A84F] text-[#1a0f05] text-sm font-semibold hover:bg-[#e8bc5e] transition-colors"
          >
            My Account
          </Link>
          <Link
            href="/select-product"
            className="px-5 py-2.5 rounded-lg border border-white/20 text-white/70 text-sm hover:border-white/40 hover:text-white transition-colors"
          >
            Design Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
