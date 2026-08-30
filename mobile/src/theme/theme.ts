export const Colors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceCard: '#334155',
  primary: '#2563eb',
  primaryLight: '#38bdf8',
  danger: '#dc2626',
  dangerLight: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Typography = {
  h1: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
  h3: { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
  body: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  caption: { fontSize: 12, color: Colors.textMuted },
};
