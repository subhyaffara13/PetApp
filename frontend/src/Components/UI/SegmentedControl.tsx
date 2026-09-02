import React from 'react';
import { motion } from 'framer-motion';

export interface SegmentedOption {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  name?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  activeId,
  onChange,
  className = '',
  name = 'segmented-control',
}) => {
  return (
    <div
      className={`ui-segmented-control ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.3rem',
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '9999px',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        width: 'fit-content',
      }}
    >
      {options.map((opt) => {
        const isActive = activeId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            className={`ui-segment-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange(opt.id)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.15rem',
              borderRadius: '9999px',
              border: 'none',
              background: 'transparent',
              color: isActive ? '#ffffff' : '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              zIndex: 1,
              transition: 'color 0.2s ease',
            }}
          >
            {isActive && (
              <motion.div
                layoutId={`${name}-active-pill`}
                className="ui-segment-active-bg"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            {opt.icon}
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '9999px',
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                }}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
