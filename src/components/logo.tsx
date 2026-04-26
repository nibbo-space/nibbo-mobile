type Props = {
  size?: number;
  className?: string;
};

export function Logo({ size = 28, className = "" }: Props) {
  return (
    <img
      src="/favicon.svg"
      alt="Nibbo"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
