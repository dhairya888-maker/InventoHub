export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {skeletons.map((i) => (
          <div key={i} className="premium-card p-5">
            <div className="skeleton mb-4 h-4 w-28" />
            <div className="skeleton mb-4 h-9 w-36" />
            <div className="skeleton h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3 p-4">
        {skeletons.map((i) => (
          <div key={i} className="skeleton h-14 w-full" />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return <div className="skeleton h-80 w-full rounded-[24px]" />;
  }

  return null;
}
