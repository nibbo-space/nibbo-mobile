type Props = {
  count?: number;
};

export function SkeletonCard({ count = 3 }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-3xl bg-white/70 shadow-cozy" />
      ))}
    </div>
  );
}
