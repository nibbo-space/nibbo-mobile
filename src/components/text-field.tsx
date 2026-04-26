type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoFocus?: boolean;
};

export function TextField({ value, onChange, placeholder, multiline, autoFocus }: Props) {
  const className =
    "w-full rounded-2xl border border-border bg-cream-50 px-4 py-3 text-sm text-text placeholder:text-subtle outline-none transition-colors focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100";

  if (multiline) {
    return (
      <textarea
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className={className}
      />
    );
  }

  return (
    <input
      value={value}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`h-12 ${className}`}
    />
  );
}
