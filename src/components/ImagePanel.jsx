import { useState } from 'react';
import toast from 'react-hot-toast';
import { generateImage } from '../services/mediaService';
import { loadPreferences } from '../utils/storage';

export default function ImagePanel() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState([]); // [{ url, prompt, id }]

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    
    const loadingToast = toast.loading('Synthesizing image...', { id: 'image-gen' });
    
    try {
      const prefs = loadPreferences();
      // Assume the service returns a URL directly or as part of an object depending on how it was implemented earlier
      const result = await generateImage(prompt, prefs.nima_model); 
      
      const newImage = {
        id: Date.now().toString(),
        url: result.data ? result.data[0].url : result, 
        prompt: prompt
      };
      
      setImages(prev => [newImage, ...prev]);
      setPrompt('');
      toast.success('Synthesis complete.', { id: loadingToast });
      
    } catch (error) {
      toast.error('Image generation failed: ' + error.message, { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div style={{ padding: '0 40px 140px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h1 className="panel-header" style={{ marginBottom: '8px' }}>Image Synthesis</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
        Render your imagination using NVIDIA NIM or connected AI providers.
      </p>

      {/* Input Section */}
      <div style={{ 
        background: 'var(--bg-surface)', 
        backdropFilter: 'blur(24px)', 
        border: '1px solid var(--glass-border-strong)', 
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a scenery or image..."
          disabled={isGenerating}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            resize: 'none',
            outline: 'none',
            minHeight: '80px'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            PRESS ENTER TO SYNTHESIZE
          </span>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-deep)',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '32px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
              opacity: isGenerating || !prompt.trim() ? 0.5 : 1,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, { transform: 'scale(1.05)', boxShadow: '0 4px 20px rgba(255,255,255,0.2)' })}
            onMouseOut={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, { transform: 'scale(1)', boxShadow: 'none' })}
          >
            {isGenerating ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            )}
            Generate
          </button>
        </div>
      </div>

      {/* Gallery Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {images.map(img => (
          <div key={img.id} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            overflow: 'hidden',
            animation: 'fade-scale-in 0.4s ease'
          }}>
            <div style={{ paddingBottom: '100%', position: 'relative' }}>
              <img 
                src={img.url} 
                alt={img.prompt}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '13px', 
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {img.prompt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
