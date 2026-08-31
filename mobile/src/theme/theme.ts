export const Colors = {
  background: '#0a0f1d',
  surface: '#0f172a',
  surfaceCard: '#1e293b',
  surfaceElevated: '#334155',
  
  // Brand Accents
  primary: '#2563eb',
  primaryLight: '#38bdf8',
  primaryGlow: 'rgba(56, 189, 248, 0.15)',
  
  // Mobile Vet Neon Pink
  mobileVet: '#ec4899',
  mobileVetLight: '#f472b6',
  mobileVetGlow: 'rgba(236, 72, 153, 0.18)',
  
  // Wolt Cyan / DaaS
  woltBlue: '#00c2e8',
  woltGlow: 'rgba(0, 194, 232, 0.15)',
  
  // Emergency Red
  danger: '#dc2626',
  dangerLight: '#ef4444',
  dangerGlow: 'rgba(239, 68, 68, 0.2)',
  
  // Status Colors
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  purple: '#a855f7',
  purpleLight: '#c084fc',
  
  // Text & Borders
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const Typography = {
  h1: { fontSize: 22, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  h3: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  body: { fontSize: 13, color: Colors.text, lineHeight: 18 },
  caption: { fontSize: 11, color: Colors.textMuted },
  mono: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700' as const },
};
