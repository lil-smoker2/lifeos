type DonutRingProps = {
  percent: number
  color?: string
  label?: string
  size?: number
}

export function DonutRing({ percent, color = 'var(--green)', label, size = 116 }: DonutRingProps) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, percent) / 100) * circumference

  return (
    <div className="donut">
      <div className="donut-visual" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--surface-2)" strokeWidth="10" />
          <circle
            className="donut-value"
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="donut-label">{percent}%</div>
      </div>
      {label ? <span className="caption">{label}</span> : null}
    </div>
  )
}
