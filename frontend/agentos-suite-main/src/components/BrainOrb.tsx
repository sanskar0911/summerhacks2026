type Props = { size?: number; className?: string };

export function BrainOrb({ size = 56, className = "" }: Props) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-70 bg-gradient-brain animate-brain-pulse"
      />
      <div className="absolute inset-0 rounded-full bg-gradient-brain animate-brain-pulse shadow-[inset_0_0_20px_rgba(255,255,255,0.25)]" />
      <div
        className="absolute inset-[6%] rounded-full opacity-60 animate-brain-spin"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, oklch(0.95 0.05 280 / 0.5) 60deg, transparent 120deg, oklch(0.85 0.15 240 / 0.4) 220deg, transparent 300deg)",
          mask: "radial-gradient(circle, transparent 55%, black 56%, black 70%, transparent 71%)",
          WebkitMask:
            "radial-gradient(circle, transparent 55%, black 56%, black 70%, transparent 71%)",
        }}
      />
      <div className="absolute top-[18%] left-[22%] w-[24%] h-[18%] rounded-full bg-white/40 blur-[2px]" />
    </div>
  );
}
