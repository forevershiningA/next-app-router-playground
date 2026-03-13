export default function Loader({ className }: { className?: string }) {
  return (
    <div
      className={`h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white ${className}`}
    />
  );
}
