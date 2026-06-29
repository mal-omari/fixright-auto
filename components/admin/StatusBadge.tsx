const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pending:     { bg: 'rgba(255,193,7,0.15)',   color: '#FFC107', label: 'Pending' },
  confirmed:   { bg: 'rgba(74,158,255,0.15)',  color: '#4A9EFF', label: 'Confirmed' },
  in_progress: { bg: 'rgba(255,149,0,0.15)',   color: '#FF9500', label: 'In Progress' },
  completed:   { bg: 'rgba(40,200,80,0.15)',   color: '#28C850', label: 'Completed' },
  cancelled:   { bg: 'rgba(255,68,68,0.15)',   color: '#FF4444', label: 'Cancelled' },
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const cfg = STATUS_CONFIG[status ?? ''] ?? { bg: 'rgba(155,155,155,0.1)', color: '#9A8E82', label: status ?? '—' }
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '3px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
      textTransform: 'uppercase', whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {cfg.label}
    </span>
  )
}
