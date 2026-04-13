import { memo } from 'react';

export default memo(function ChatHistoryTray({ isOpen, sessions, activeSessionId, onSelect, onDelete }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      left: '96px', // Right next to FloatingSidebar (which is 80px wide + margin)
      top: '0',
      bottom: '0',
      width: '300px',
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(32px)',
      borderRight: '1px solid var(--glass-border-strong)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slide-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{ padding: '32px 24px 16px' }}>
        <h2 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: '20px', 
          color: 'var(--text-primary)',
          margin: 0
        }}>
          History
        </h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        {sessions.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>
            No recent sessions.
          </p>
        )}
        
        {sessions.map(session => {
          const isActive = session.id === activeSessionId;
          const date = new Date(session.updatedAt);
          const timeString = isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

          return (
            <div 
              key={session.id}
              onClick={() => onSelect(session.id)}
              style={{
                padding: '12px 16px',
                marginBottom: '8px',
                borderRadius: '12px',
                background: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                border: isActive ? '1px solid var(--glass-border)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseOver={(e) => !isActive && Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.02)' })}
              onMouseOut={(e) => !isActive && Object.assign(e.currentTarget.style, { background: 'transparent' })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  color: isActive ? 'var(--accent-teal)' : 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: isActive ? '500' : '400',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  marginRight: '8px'
                }}>
                  {session.title || 'Untitled Session'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  title="Delete"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    opacity: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: '0.2s',
                    borderRadius: '4px'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                  onMouseOut={(e) => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <span>{session.messages?.length || 0} msgs</span>
                <span>{timeString}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
