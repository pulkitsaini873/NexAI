import { useState, useRef, useEffect } from 'react';

export default function IslandInput({ onSend, isLoading, webSearchEnabled, onToggleWebSearch }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '24px'; // Reset to min
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [input]);

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="island-container">
      <div className="island-input">
        <button
          className={`island-action-btn ${webSearchEnabled ? 'active' : ''}`}
          onClick={onToggleWebSearch}
          title={webSearchEnabled ? 'Search Enabled' : 'Search Web'}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          className="island-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={isLoading}
        />

        <button
          className="island-send-btn"
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--bg-deep)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
