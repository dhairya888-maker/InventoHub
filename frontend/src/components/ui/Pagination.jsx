import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <button className="icon-btn" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        {start > 1 && (
          <>
            <button className="btn-ghost h-10 w-10 p-0" onClick={() => onPageChange(1)}>1</button>
            {start > 2 && <span className="px-1" style={{ color: 'var(--soft)' }}>...</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={p === page ? 'btn-primary h-10 w-10 p-0' : 'btn-ghost h-10 w-10 p-0'}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1" style={{ color: 'var(--soft)' }}>...</span>}
            <button className="btn-ghost h-10 w-10 p-0" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button className="icon-btn" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
