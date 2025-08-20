import { Boundary } from '#/ui/boundary';

export default function Byline() {
  return (
    <div className="flex gap-4 text-sm font-medium text-gray-600">
      <a
        className="transition-colors hover:text-gray-200"
        href="https://www.forevershining.com.au/"
        target="_blank"
        rel="noreferrer"
      >
        &copy; 2025 by Forever Shining
      </a>
    
    </div>
  );
}
