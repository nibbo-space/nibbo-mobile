type Props = {
  emoji: string;
  title: string;
  subtitle: string;
};

export function EmptyState({ emoji, title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-12 text-center shadow-cozy">
      <span className="animate-float text-5xl">{emoji}</span>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
    </div>
  );
}
