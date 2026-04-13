import { useState, useRef, useEffect } from 'react';
import { getModelsByProvider, getModelById, CHAT_MODELS } from '../config/models';
import { hasApiKey } from '../services/providerAdapter';

export default function ModelSelector({ selectedModel, onModelChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState(null);
  const dropdownRef = useRef(null);

  const model = getModelById(selectedModel);
  const groupedModels = getModelsByProvider();

  useEffect(() => {
    if (isOpen && model) {
      setActiveProvider(model.provider);
    } else if (isOpen && !activeProvider && CHAT_MODELS.length > 0) {
      setActiveProvider(CHAT_MODELS[0].provider);
    }
  }, [isOpen, model]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const providerGroup = groupedModels[activeProvider];
  const providerHasKey = hasApiKey(activeProvider);

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
          width: '500px',
          background: 'var(--bg-surface-active)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          boxShadow: 'var(--glass-shadow)',
          zIndex: 1000,
          display: 'flex',
          overflow: 'hidden'
        }}>
          {/* Provider Sidebar */}
          <div style={{
            width: '160px',
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--glass-border)',
            padding: '8px 0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {Object.entries(groupedModels).map(([providerKey, group]) => {
              const hasKey = hasApiKey(providerKey);
              const isActive = providerKey === activeProvider;
              return (
                <button
                  key={providerKey}
                  onClick={() => setActiveProvider(providerKey)}
                  style={{
                    padding: '12px 16px',
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: isActive ? '2px solid var(--accent-teal)' : '2px solid transparent',
                    transition: '0.2s'
                  }}
                  onMouseOver={(e) => !isActive && Object.assign(e.currentTarget.style, { color: 'var(--text-primary)' })}
                  onMouseOut={(e) => !isActive && Object.assign(e.currentTarget.style, { color: 'var(--text-secondary)' })}
                >
                  <span>{group.provider.name}</span>
                  {!hasKey && (
                     <div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444'}} title="Missing API Key" />
                  )}
                  {hasKey && (
                     <div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10B981'}} title="API Key Linked" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Model List */}
          <div style={{
            flex: 1,
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '8px 0'
          }}>
             {!providerHasKey && (
               <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                 <p style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '8px', color: 'var(--text-secondary)'}}>API Key Required</p>
                 <p style={{ fontSize: '13px', lineHeight: 1.5}}>Configure your {providerGroup?.provider.name} key in Settings to unlock these models.</p>
               </div>
             )}
             
             {providerGroup && providerGroup.models.map((m) => (
                <button
                  key={m.id}
                  disabled={!providerHasKey}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 20px',
                    background: 'none',
                    border: 'none',
                    color: m.id === selectedModel ? 'var(--accent-teal)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    opacity: providerHasKey ? 1 : 0.3,
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
                  onMouseOver={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' })}
                  onMouseOut={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, { background: 'none', color: m.id === selectedModel ? 'var(--accent-teal)' : 'var(--text-secondary)' })}
                >
                  <span style={{flex: 1}}>{m.name}</span>
                  {m.badge && (
                    <span style={{
                      padding: '2px 6px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      fontSize: '9px',
                      textTransform: 'uppercase'
                    }}>
                      {m.badge}
                    </span>
                  )}
                </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
