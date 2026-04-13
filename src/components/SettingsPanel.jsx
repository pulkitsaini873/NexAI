import { useState, useEffect } from 'react';
import { loadPreferences, savePreferences } from '../utils/storage';
import { getApiKeys, saveApiKey } from '../services/providerAdapter';
import toast from 'react-hot-toast';

export default function SettingsPanel() {
  const [prefs, setPrefs] = useState({
    systemPrompt: 'You are NexAI, an intelligent and extremely capable AI assistant.',
    liveTts: false,
    ttsVoice: 'en-US-Journey-F'
  });
  const [keys, setKeys] = useState({});

  useEffect(() => {
    setPrefs(loadPreferences());
    setKeys(getApiKeys());
  }, []);

  function handleSavePref(key, value) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    savePreferences(updated);
  }

  function handleSaveKey(providerKey, value) {
    setKeys({ ...keys, [providerKey]: value });
    saveApiKey(providerKey, value.trim());
    toast.success(`${providerKey.toUpperCase()} Key Saved.`);
  }

  const sectionStyle = {
    background: 'var(--bg-surface)',
    backdropFilter: 'blur(24px)',
    border: '1px solid var(--glass-border-strong)',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '32px'
  };

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    transition: '0.2s',
    marginBottom: '24px'
  };

  return (
    <div style={{ padding: '0 40px 140px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <h1 className="panel-header" style={{ marginBottom: '8px' }}>System Configuration</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
        Manage access keys, behaviors, and core capabilities.
      </p>

      {/* Global AI Behavior */}
      <div style={sectionStyle}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '24px', color: 'var(--text-primary)' }}>
          Core Identity
        </h2>
        <label style={labelStyle}>System Prompt</label>
        <textarea
          value={prefs.systemPrompt}
          onChange={(e) => handleSavePref('systemPrompt', e.target.value)}
          style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', fontFamily: 'var(--font-sans)' }}
          onFocus={(e) => Object.assign(e.target.style, { borderColor: 'var(--accent-teal)' })}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--glass-border)' })}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
          <div>
            <label style={{ ...labelStyle, marginBottom: 0, color: 'var(--text-primary)' }}>Live TTS Playback</label>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Automatically read AI responses aloud</p>
          </div>
          <button
            onClick={() => handleSavePref('liveTts', !prefs.liveTts)}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              background: prefs.liveTts ? 'var(--accent-teal)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '2px',
              left: prefs.liveTts ? '22px' : '2px',
              width: '20px',
              height: '20px',
              borderRadius: '10px',
              background: 'white',
              transition: '0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>
      </div>

      {/* Providers Configuration */}
      <div style={sectionStyle}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '24px', color: 'var(--text-primary)' }}>
          Provider Access Keys
        </h2>
        
        {['groq', 'google', 'openrouter', 'nvidia', 'mistral'].map(provider => (
          <div key={provider}>
            <label style={labelStyle}>{provider} API Key</label>
            <input
              type="password"
              placeholder={`sk-...`}
              value={keys[provider] || ''}
              onChange={(e) => setKeys({ ...keys, [provider]: e.target.value })}
              onBlur={(e) => handleSaveKey(provider, e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, { borderColor: 'var(--accent-teal)' })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
