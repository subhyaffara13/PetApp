import React from 'react';
import './UI.css';

export interface SkeletonProps {
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
  className?: string;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  className = '',
  borderRadius,
}) => {
  return (
    <div
      className={`ui-skeleton ui-skeleton--${variant} ${className}`}
      style={{
        width: width ?? (variant === 'circle' ? 40 : '100%'),
        height: height ?? (variant === 'text' ? 14 : variant === 'circle' ? 40 : 80),
        borderRadius: borderRadius ?? (variant === 'circle' ? '50%' : undefined),
      }}
    />
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="ui-skeleton-cards-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ui-card ui-skeleton-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Skeleton variant="circle" width={44} height={44} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
          </div>
          <Skeleton variant="rect" height={36} borderRadius="0.5rem" />
        </div>
      ))}
    </div>
  );
};
