import { useState, useEffect } from 'react';
import { PROVIDERS } from '../config/models';
import { saveApiKey } from '../services/providerAdapter';
import { isOnboarded, setOnboarded } from '../utils/storage';

export default function ApiKeyModal({ onClose }) {
  const [keys, setKeys] = useState({});
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnboarded()) {
      setShow(true);
    }
  }, []);

  function handleSave() {
    Object.entries(keys).forEach(([providerKey, value]) => {
      if (value.trim()) {
        saveApiKey(providerKey, value.trim());
      }
    });
    setOnboarded();
    setShow(false);
    onClose?.();
  }

  function handleSkip() {
    setOnboarded();
    setShow(false);
    onClose?.();
  }

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'var(--bg-surface-active)',
        border: '1px solid var(--glass-border-strong)',
        borderRadius: '32px',
        padding: '40px',
        width: '90%',
        maxWidth: '560px',
        boxShadow: 'var(--glass-shadow)'
      }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontStyle: 'italic', marginBottom: '16px' }}>
          Welcome to NexAI
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
          Enter your free API keys to get started. Keys are stored safely in local memory.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', maxHeight: '40vh', overflowY: 'auto', paddingRight: '8px' }}>
          {Object.entries(PROVIDERS).map(([key, provider]) => (
            <div key={key}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                {provider.name}
              </label>
              <input
                type="password"
                value={keys[key] || ''}
                onChange={(e) => setKeys((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={`sk-...`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  transition: '0.2s'
                }}
                onFocus={(e) => Object.assign(e.target.style, { borderColor: 'var(--accent-teal)' })}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--glass-border)' })}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={handleSkip}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '12px 24px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              cursor: 'pointer',
              borderRadius: '20px',
            }}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, { color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)' })}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, { color: 'var(--text-muted)', background: 'transparent' })}
          >
            Skip for now
          </button>
          <button 
            onClick={handleSave}
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-deep)',
              border: 'none',
              padding: '12px 24px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(255,255,255,0.2)'
            }}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, { transform: 'scale(1.05)' })}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, { transform: 'scale(1)' })}
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}
