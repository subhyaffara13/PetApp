import React from 'react';

export interface SpendingCategory {
  label: string;
  amount: number;
  color: string;
  icon: string;
}

interface SpendingPieChartProps {
  categories: SpendingCategory[];
  total: number;
}

export const SpendingPieChart: React.FC<SpendingPieChartProps> = ({ categories, total }) => {
  let cumulativeAngle = 0;
  const radius = 70;
  const cx = 90;
  const cy = 90;

  if (total <= 0) {
    return <div className="pie-chart-empty">No spending data recorded yet.</div>;
  }

  const slices = categories.map((cat) => {
    const fraction = cat.amount / total;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { ...cat, pathData, percentage: Math.round(fraction * 100) };
  });

  return (
    <div className="spending-pie-container">
      <svg width="180" height="180" viewBox="0 0 180 180" className="spending-pie-svg">
        {slices.map((slice, idx) => (
          <path
            key={idx}
            d={slice.pathData}
            fill={slice.color}
            stroke="#0f172a"
            strokeWidth="2"
            className="pie-slice"
          >
            <title>{slice.label}: ₪{slice.amount.toFixed(0)} ({slice.percentage}%)</title>
          </path>
        ))}
        {/* Donut Hole */}
        <circle cx={cx} cy={cy} r={radius * 0.55} fill="#0f172a" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Total Spend</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="800">₪{total.toFixed(0)}</text>
      </svg>

      <div className="spending-legend-grid">
        {slices.map((cat, idx) => (
          <div key={idx} className="legend-item">
            <div className="legend-marker" style={{ backgroundColor: cat.color }} />
            <div className="legend-text">
              <span className="legend-label">{cat.icon} {cat.label}</span>
              <span className="legend-amount">₪{cat.amount.toFixed(0)} ({cat.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
