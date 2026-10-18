type MoralBarProps = {
  label: string;
  value: number;
  max: number;
  tone: "student" | "activist";
};

export function MoralBar({ label, value, max, tone }: MoralBarProps) {
  const cap = Math.max(max, value, 1);
  const pct = Math.max(0, Math.min(100, (value / cap) * 100));

  return (
    <div className={`moral moral-${tone}`}>
      <div className="moral-label">
        <span>{label}</span>
        <span>{Math.max(0, value)}</span>
      </div>
      <div className="moral-track" aria-hidden="true">
        <div className="moral-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
