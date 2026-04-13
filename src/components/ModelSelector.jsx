import { useState, useRef, useEffect } from 'react';
import { getModelsByProvider, getModelById } from '../config/models';
import { hasApiKey } from '../services/providerAdapter';

export default function ModelSelector({ selectedModel, onModelChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const model = getModelById(selectedModel);
  const groupedModels = getModelsByProvider();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'var(--bg-surface)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--glass-border-strong)',
          borderRadius: '20px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseOver={(e) => Object.assign(e.currentTarget.style, { background: 'var(--bg-surface-hover)' })}
        onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: 'var(--bg-surface)' })}
      >
        <span>{model?.name || 'Select Model'}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          minWidth: '280px',
          maxHeight: '400px',
          overflowY: 'auto',
          background: 'var(--bg-surface-active)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          boxShadow: 'var(--glass-shadow)',
          zIndex: 1000,
          padding: '8px 0'
        }}>
          {Object.entries(groupedModels).map(([providerKey, group]) => {
            const providerHasKey = hasApiKey(providerKey);
            return (
              <div key={providerKey}>
                <div style={{
                  padding: '8px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--accent-teal)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {group.provider.name} {!providerHasKey && '(NO KEY)'}
                </div>
                {group.models.map((m) => (
                  <button
                    key={m.id}
                    disabled={!providerHasKey}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      color: m.id === selectedModel ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      opacity: providerHasKey ? 1 : 0.4,
                      cursor: providerHasKey ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onClick={() => {
                      if (!providerHasKey) return;
                      onModelChange(m.id);
                      setIsOpen(false);
                    }}
                    onMouseOver={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' })}
                    onMouseOut={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, { background: 'none', color: m.id === selectedModel ? 'var(--text-primary)' : 'var(--text-secondary)' })}
                  >
                    <span>{m.name}</span>
                    {m.badge && (
                      <span style={{
                        padding: '2px 6px',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {m.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
