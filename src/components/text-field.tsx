type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function TextField({ value, onChange, placeholder }: Props) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-12 w-full rounded-xl border border-white/10 bg-surface px-4 text-sm text-text outline-none focus:border-primary"
    />
  );
}
