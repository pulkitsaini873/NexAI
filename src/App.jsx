import { useState, useRef, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import FloatingSidebar from './components/FloatingSidebar';
import IslandInput from './components/IslandInput';
import ChatInterface from './components/ChatInterface';
import ModelSelector from './components/ModelSelector'; 
import ApiKeyModal from './components/ApiKeyModal'; 
import ImagePanel from './components/ImagePanel';
import SettingsPanel from './components/SettingsPanel';
import ChatHistoryTray from './components/ChatHistoryTray';

// The earlier imports are handled. Here is where the layout hooks.


import { streamChat } from './services/providerAdapter';
import { searchWeb, buildSearchContext, synthesizeSearchData } from './services/searchService';
import { synthesizeSpeech, playAudio } from './services/mediaService';
import { 
  loadSessions, 
  saveSession, 
  deleteSession, 
  loadPreferences, 
  savePreferences,
  loadSystemPrompt
} from './utils/storage';
import { getModelsByProvider } from './config/models';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const loadedSessions = loadSessions();
    setSessions(loadedSessions);
    
    if (loadedSessions.length > 0) {
      setActiveSessionId(loadedSessions[0].id);
      setMessages(loadedSessions[0].messages || []);
    } else {
      const initId = crypto.randomUUID();
      setActiveSessionId(initId);
      setSessions([{ id: initId, title: 'New Chat', messages: [], updatedAt: Date.now() }]);
    }

    const prefs = loadPreferences();
    setSelectedModel(prefs.selectedModel);
    setWebSearchEnabled(prefs.webSearchDefault || false);

    if (!prefs.selectedModel) {
      const groups = getModelsByProvider();
      const firstAvailable = Object.values(groups)[0]?.models[0];
      if (firstAvailable) setSelectedModel(firstAvailable.id);
    }
  }, []);

  useEffect(() => {
    if (activeSessionId && (messages.length > 0 || sessions.length === 1)) {
      let title = 'New Chat';
      const userMsg = messages.find(m => m.role === 'user');
      if (userMsg && userMsg.content) {
        title = userMsg.content.substring(0, 30) + (userMsg.content.length > 30 ? '...' : '');
      }

      saveSession(activeSessionId, title, messages);
      
      setSessions(prev => {
        const idx = prev.findIndex(s => s.id === activeSessionId);
        const updated = { id: activeSessionId, title, messages, updatedAt: Date.now() };
        if (idx >= 0) {
           const next = [...prev];
           next[idx] = updated;
           return next.sort((a, b) => b.updatedAt - a.updatedAt);
        }
        return [updated, ...prev].sort((a, b) => b.updatedAt - a.updatedAt);
      });
    }
  }, [messages, activeSessionId]);

  useEffect(() => {
    if (selectedModel) {
      savePreferences({ selectedModel });
    }
  }, [selectedModel]);

  function handleNewChat() {
    const id = crypto.randomUUID();
    const newSession = { id, title: 'New Chat', messages: [], updatedAt: Date.now() };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);
    setMessages([]);
    setActiveTab('chat');
    setIsHistoryOpen(false);
    if (currentAudio) {
      currentAudio.stop();
      setCurrentAudio(null);
    }
  }

  function handleSelectSession(id) {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setActiveSessionId(id);
      setMessages(session.messages || []);
      setActiveTab('chat');
    }
  }

  function handleDeleteSession(id) {
    deleteSession(id);
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        setMessages(updated[0].messages || []);
      } else {
        handleNewChat();
      }
    }
  }

  async function handleSend(content) {
    if (!content.trim() || isStreaming) return;
    
    abortControllerRef.current = new AbortController();
    let updatedMessages = [...messages, { role: 'user', content }];
    setMessages(updatedMessages);
    setIsStreaming(true);

    try {
      let finalContent = content;
      let sources = [];
      let searchUsed = false;

      if (webSearchEnabled) {
        setMessages((prev) => [
          ...prev, 
          { role: 'assistant', content: 'Agentic Research initializing...', _searchIndicator: true }
        ]);
        
        try {
          const rawResults = await searchWeb(content);
          if (rawResults.length > 0) {
            setMessages((prev) => prev.map(m => m._searchIndicator ? { ...m, content: 'Synthesizing data...' } : m));
            const synthesized = await synthesizeSearchData(content, rawResults);
            
            sources = synthesized;
            searchUsed = true;
            finalContent = `${content}\n\n${buildSearchContext(synthesized)}`;
          }
        } catch (e) {
          toast.error('Search synthesis failed, proceeding normally.');
        }
        
        setMessages((prev) => prev.filter(m => !m._searchIndicator));
      }

      const assistantMessageId = Date.now().toString();
      const newAssistantMsg = { 
        id: assistantMessageId,
        role: 'assistant', 
        content: '',
        model: selectedModel,
        sources,
        searchUsed
      };
      
      setMessages((prev) => [...prev, newAssistantMsg]);
      let currentText = '';
      const systemPrompt = loadSystemPrompt();
      
      const apiMessages = updatedMessages.map(m => ({ 
        role: m.role, 
        content: m === updatedMessages[updatedMessages.length - 1] ? finalContent : m.content 
      }));

      await streamChat({
        modelId: selectedModel,
        messages: apiMessages,
        systemPrompt,
        signal: abortControllerRef.current.signal,
        onToken: (token) => {
          currentText += token;
          setMessages(prev => prev.map(m => 
            m.id === assistantMessageId ? { ...m, content: currentText } : m
          ));
        },
        onDone: () => {
          setIsStreaming(false);
          const prefs = loadPreferences();
          if (prefs.liveTts && currentText) {
             handleTtsPlay(currentText);
          }
        },
        onError: (err) => {
          if (err.name !== 'AbortError') {
             toast.error(err.message);
             setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, content: currentText + '\n\n**[Error generating response]**' } 
                  : m
             ));
          }
           setIsStreaming(false);
        }
      });

    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error(err.message);
      }
      setIsStreaming(false);
    }
  }

  async function handleTtsPlay(text) {
    if (currentAudio) {
      currentAudio.stop();
      setCurrentAudio(null);
    }
    try {
      toast.loading('Synthesizing speech...', { id: 'tts' });
      const prefs = loadPreferences();
      const source = await synthesizeSpeech(text, prefs.ttsVoice);
      toast.dismiss('tts');
      const audioControl = playAudio(source);
      setCurrentAudio(audioControl);
    } catch (e) {
      toast.error('TTS failed: ' + e.message, { id: 'tts' });
    }
  }

  return (
    <>
      <ApiKeyModal />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-surface-active)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border-strong)',
            backdropFilter: 'blur(24px)',
            fontFamily: 'var(--font-sans)',
            borderRadius: '16px',
          }
        }}
      />

      <div className="aurora-container">
        <div className="aurora-blob blob-1" />
        <div className="aurora-blob blob-2" />
        <div className="aurora-blob blob-3" />
      </div>
      <div className="grain-overlay" />

      <div className="app-container">
        <FloatingSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onNewChat={handleNewChat}
          isHistoryOpen={isHistoryOpen}
          onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
        />
        
        <ChatHistoryTray 
          isOpen={isHistoryOpen}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={(id) => { handleSelectSession(id); setIsHistoryOpen(false); }}
          onDelete={handleDeleteSession}
        />

        <main className="view-container">
          <header style={{ padding: '32px 40px', display: 'flex', justifyContent: 'flex-end', zIndex: 10 }}>
            {activeTab === 'chat' && (
              <ModelSelector 
                selectedModel={selectedModel} 
                onModelChange={setSelectedModel} 
              />
            )}
          </header>

          {activeTab === 'chat' && (
            <>
              <ChatInterface 
                messages={messages} 
                isStreaming={isStreaming} 
                onTtsPlay={handleTtsPlay} 
              />
              <IslandInput 
                onSend={handleSend}
                isLoading={isStreaming}
                webSearchEnabled={webSearchEnabled}
                onToggleWebSearch={() => {
                  setWebSearchEnabled(!webSearchEnabled);
                  savePreferences({ webSearchDefault: !webSearchEnabled });
                }}
              />
            </>
          )}

          {activeTab === 'image' && (
            <ImagePanel />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel />
          )}
        </main>
      </div>
    </>
  );
}
