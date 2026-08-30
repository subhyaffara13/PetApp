import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation, type LanguageCode } from '../../context/LanguageContext';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  variant?: 'pill' | 'dropdown' | 'compact';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'pill', className = '' }) => {
  const { currentLang, setLang, languages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = languages.find((l) => l.code === currentLang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLang(code);
    setIsOpen(false);
  };

  return (
    <div className={`language-selector-wrap ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`lang-btn lang-btn--${variant}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change Language"
        id="language-toggle-btn"
      >
        <Globe size={15} className="lang-icon" />
        <span className="lang-flag">{currentOption.flag}</span>
        <span className="lang-code">{currentOption.code.toUpperCase()}</span>
        <ChevronDown size={12} className={`lang-chevron ${isOpen ? 'lang-chevron--open' : ''}`} />
      </button>

      {isOpen && (
        <div className="lang-dropdown card animate-scale-up" id="language-dropdown-menu">
          <div className="lang-dropdown__header">{t('common.select_language', 'Select Language')}</div>
          <div className="lang-options-list">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`lang-option-item ${lang.code === currentLang ? 'lang-option-item--active' : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                <span className="lang-option-flag">{lang.flag}</span>
                <span className="lang-option-name">{lang.nativeName}</span>
                {lang.code === currentLang && <Check size={14} className="lang-option-check" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
