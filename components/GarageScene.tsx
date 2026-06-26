export default function GarageScene() {
  const spokes = [0, 60, 120, 180, 240, 300]

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: '4 / 3',
        background: '#080808',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '2px',
      }}
    >
      <svg
        viewBox="0 0 500 375"
        xmlns="http://www.w3.org/2000/svg"
        className="svg-float h-full w-full"
        aria-label="Illustrated garage diagnostic scene"
      >
        {/* Background grid */}
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={`vg${i}`}
            x1={(i + 1) * 50}
            y1="0"
            x2={(i + 1) * 50}
            y2="375"
            stroke="#00D4FF"
            strokeWidth="0.3"
            strokeOpacity="0.06"
          />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line
            key={`hg${i}`}
            x1="0"
            y1={(i + 1) * 50}
            x2="500"
            y2={(i + 1) * 50}
            stroke="#00D4FF"
            strokeWidth="0.3"
            strokeOpacity="0.06"
          />
        ))}

        {/* Corner bracket accents */}
        <path d="M25 25 L25 52 M25 25 L52 25" stroke="#00D4FF" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />
        <path d="M475 25 L475 52 M475 25 L448 25" stroke="#00D4FF" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />
        <path d="M25 350 L25 323 M25 350 L52 350" stroke="#00D4FF" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />
        <path d="M475 350 L475 323 M475 350 L448 350" stroke="#00D4FF" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />

        {/* Lift posts */}
        <rect x="133" y="249" width="7" height="64" rx="1" fill="#141414" stroke="#2a2a2a" strokeWidth="0.5" />
        <rect x="360" y="249" width="7" height="64" rx="1" fill="#141414" stroke="#2a2a2a" strokeWidth="0.5" />

        {/* Lift platform */}
        <rect x="118" y="243" width="264" height="7" rx="1" fill="#0F0F0F" stroke="#00D4FF" strokeWidth="0.9" strokeOpacity="0.55" />
        <rect x="118" y="243" width="264" height="7" rx="1" fill="none" stroke="#00D4FF" strokeWidth="4" strokeOpacity="0.06" />

        {/* Car body */}
        <path
          d="M108 235 L118 197 L152 164 L202 149 L298 149 L350 164 L383 197 L393 235 Z"
          fill="#0C0C0C"
          stroke="#00D4FF"
          strokeWidth="1.2"
          strokeOpacity="0.65"
        />

        {/* Cabin / windows */}
        <path
          d="M156 232 L169 179 L204 161 L296 161 L333 179 L345 232 Z"
          fill="#070707"
          stroke="#00D4FF"
          strokeWidth="0.6"
          strokeOpacity="0.3"
        />
        {/* Window dividers */}
        <line x1="220" y1="232" x2="214" y2="161" stroke="#00D4FF" strokeWidth="0.5" strokeOpacity="0.25" />
        <line x1="280" y1="232" x2="286" y2="161" stroke="#00D4FF" strokeWidth="0.5" strokeOpacity="0.25" />

        {/* Headlight glow */}
        <rect x="382" y="201" width="13" height="5" rx="1" fill="#00D4FF" fillOpacity="0.35" />
        <rect x="382" y="201" width="13" height="5" rx="1" fill="none" stroke="#00D4FF" strokeWidth="0.5" strokeOpacity="0.7" />
        {/* Taillight glow */}
        <rect x="105" y="201" width="13" height="5" rx="1" fill="#FF9500" fillOpacity="0.25" />
        <rect x="105" y="201" width="13" height="5" rx="1" fill="none" stroke="#FF9500" strokeWidth="0.5" strokeOpacity="0.55" />

        {/* Left wheel */}
        <circle cx="165" cy="239" r="30" fill="#090909" stroke="#222" strokeWidth="2.5" />
        <circle cx="165" cy="239" r="21" fill="#090909" stroke="#00D4FF" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="165" cy="239" r="10" fill="#0F0F0F" stroke="#00D4FF" strokeWidth="0.7" strokeOpacity="0.45" />
        {spokes.map(angle => (
          <line
            key={`ls${angle}`}
            x1={165 + 10 * Math.cos((angle * Math.PI) / 180)}
            y1={239 + 10 * Math.sin((angle * Math.PI) / 180)}
            x2={165 + 21 * Math.cos((angle * Math.PI) / 180)}
            y2={239 + 21 * Math.sin((angle * Math.PI) / 180)}
            stroke="#00D4FF"
            strokeWidth="0.6"
            strokeOpacity="0.25"
          />
        ))}

        {/* Right wheel */}
        <circle cx="335" cy="239" r="30" fill="#090909" stroke="#222" strokeWidth="2.5" />
        <circle cx="335" cy="239" r="21" fill="#090909" stroke="#00D4FF" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="335" cy="239" r="10" fill="#0F0F0F" stroke="#00D4FF" strokeWidth="0.7" strokeOpacity="0.45" />
        {spokes.map(angle => (
          <line
            key={`rs${angle}`}
            x1={335 + 10 * Math.cos((angle * Math.PI) / 180)}
            y1={239 + 10 * Math.sin((angle * Math.PI) / 180)}
            x2={335 + 21 * Math.cos((angle * Math.PI) / 180)}
            y2={239 + 21 * Math.sin((angle * Math.PI) / 180)}
            stroke="#00D4FF"
            strokeWidth="0.6"
            strokeOpacity="0.25"
          />
        ))}

        {/* Floor */}
        <line x1="60" y1="313" x2="440" y2="313" stroke="#00D4FF" strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="100" y1="319" x2="400" y2="319" stroke="#00D4FF" strokeWidth="0.3" strokeOpacity="0.08" />

        {/* Car ambient glow */}
        <ellipse cx="250" cy="280" rx="140" ry="12" fill="#00D4FF" fillOpacity="0.035" />

        {/* Diagnostic scan beam */}
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
            <stop offset="20%" stopColor="#00D4FF" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#00D4FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="78" y="190" width="344" height="1.5" fill="url(#scanGrad)" />

        {/* Vertical scan guide rails */}
        <line x1="78" y1="149" x2="78" y2="313" stroke="#00D4FF" strokeWidth="0.4" strokeOpacity="0.1" strokeDasharray="4 5" />
        <line x1="422" y1="149" x2="422" y2="313" stroke="#00D4FF" strokeWidth="0.4" strokeOpacity="0.1" strokeDasharray="4 5" />

        {/* ── Diagnostics panel – top left ── */}
        <rect x="28" y="46" width="118" height="80" rx="2" fill="#060C0F" stroke="#00D4FF" strokeWidth="0.7" strokeOpacity="0.4" />
        <line x1="28" y1="60" x2="146" y2="60" stroke="#00D4FF" strokeWidth="0.5" strokeOpacity="0.2" />
        <text x="36" y="56" fill="#00D4FF" fontSize="7" fontFamily="monospace" fontWeight="bold">DIAGNOSTICS</text>
        <text x="36" y="74" fill="#555" fontSize="6.5" fontFamily="monospace">ENGINE  </text>
        <text x="96" y="74" fill="#00CC66" fontSize="6.5" fontFamily="monospace">PASS</text>
        <text x="36" y="87" fill="#555" fontSize="6.5" fontFamily="monospace">BRAKES  </text>
        <text x="96" y="87" fill="#00CC66" fontSize="6.5" fontFamily="monospace">PASS</text>
        <text x="36" y="100" fill="#555" fontSize="6.5" fontFamily="monospace">TIRES   </text>
        <text x="96" y="100" fill="#00CC66" fontSize="6.5" fontFamily="monospace">PASS</text>
        <text x="36" y="113" fill="#555" fontSize="6.5" fontFamily="monospace">OBD II  </text>
        <text x="96" y="113" fill="#00CC66" fontSize="6.5" fontFamily="monospace">CLEAR</text>

        {/* ── Safety cert panel – top right ── */}
        <rect x="354" y="46" width="118" height="80" rx="2" fill="#0E0A04" stroke="#FF9500" strokeWidth="0.7" strokeOpacity="0.4" />
        <line x1="354" y1="60" x2="472" y2="60" stroke="#FF9500" strokeWidth="0.5" strokeOpacity="0.2" />
        <text x="362" y="56" fill="#FF9500" fontSize="7" fontFamily="monospace" fontWeight="bold">SAFETY CERT</text>
        <text x="362" y="74" fill="#555" fontSize="6.5" fontFamily="monospace">STEERING</text>
        <text x="418" y="74" fill="#00CC66" fontSize="6.5" fontFamily="monospace">OK</text>
        <text x="362" y="87" fill="#555" fontSize="6.5" fontFamily="monospace">EXHAUST </text>
        <text x="418" y="87" fill="#00CC66" fontSize="6.5" fontFamily="monospace">OK</text>
        <text x="362" y="100" fill="#555" fontSize="6.5" fontFamily="monospace">LIGHTS  </text>
        <text x="418" y="100" fill="#00CC66" fontSize="6.5" fontFamily="monospace">OK</text>
        <text x="362" y="113" fill="#FF9500" fontSize="6" fontFamily="monospace">STATUS: VALID</text>
      </svg>
    </div>
  )
}
