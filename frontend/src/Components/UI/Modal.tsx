import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './UI.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '540px',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="ui-modal-overlay" onClick={onClose}>
          <motion.div
            className="ui-modal-container"
            style={{ maxWidth }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            {(title || showCloseButton) && (
              <div className="ui-modal-header">
                {title && <h3 className="ui-modal-title">{title}</h3>}
                {showCloseButton && (
                  <button
                    type="button"
                    className="ui-modal-close-btn"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            <div className="ui-modal-body">{children}</div>

            {footer && <div className="ui-modal-footer">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
