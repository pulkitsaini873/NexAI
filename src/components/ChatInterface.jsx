import { useEffect, useRef } from 'react';
import { parseMarkdown } from '../utils/markdown';

export default function ChatInterface({ messages, isStreaming, onTtsPlay }) {
  const endRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="chat-scroll-area">
        <div className="chat-empty">
          <h1>NexAI</h1>
          <p>Intelligence without constraints. Experience multi-model clarity wrapped in raw atmosphere.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-scroll-area">
      <div className="chat-history">
        {messages.map((m, i) => {
          if (m._searchIndicator) {
            return (
              <div key="search-ind" className="message-row assistant">
                <div className="message-meta">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                  Synthesizing Web Reality...
                </div>
              </div>
            );
          }

          const isAssistant = m.role === 'assistant';
          const isLatestStream = isStreaming && i === messages.length - 1 && isAssistant;

          return (
            <div key={m.id || i} className={`message-row ${m.role}`}>
              <div className="message-meta">
                {isAssistant ? m.modelName || m.model || 'NEXAI' : 'YOU'}
                {m.searchUsed && <span style={{ color: 'var(--accent-teal)' }}>[ WEB SEARCHED ]</span>}
              </div>
              <div 
                className="message-content"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(m.content) + (isLatestStream ? '<span class="streaming-dot"></span>' : '') }}
              />
              {isAssistant && m.sources && m.sources.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-amethyst)',
                      textDecoration: 'none',
                      background: 'rgba(168, 85, 247, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(168, 85, 247, 0.2)'
                    }}>
                      [{idx + 1}] {s.title?.slice(0, 30)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <style>{`
        .streaming-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-primary);
          margin-left: 8px;
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
