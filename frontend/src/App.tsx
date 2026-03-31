import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Terminal, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Server,
  Moon,
  Sun
} from 'lucide-react';

interface DockerContainer {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Labels: Record<string, string>;
}

const App: React.FC = () => {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [lighthouseActive, setLighthouseActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8f9fa',
    surface: isDarkMode ? '#1e293b' : '#ffffff',
    border: isDarkMode ? '#334155' : '#e5e7eb',
    textPrimary: isDarkMode ? '#f8fafc' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    accent: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    cardShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  };

  const fetchContainers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/containers');
      setContainers(response.data);
    } catch (err) {
      console.error('Backend connection failed', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/lighthouse/logs');
      setLogs(response.data);
      setLighthouseActive(true);
    } catch (err) {
      setLighthouseActive(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    fetchLogs();
    const interval = setInterval(() => {
      fetchContainers();
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: containers.length,
    running: containers.filter(c => c.State === 'running').length,
    stopped: containers.filter(c => c.State !== 'running').length,
  };

  const systemHealthy = lighthouseActive && stats.stopped === 0;

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: '"Inter", -apple-system, sans-serif', 
      backgroundColor: theme.bg, 
      minHeight: '100vh',
      color: theme.textPrimary,
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        backgroundColor: theme.surface,
        padding: '20px 30px',
        borderRadius: '20px',
        border: `1px solid ${theme.border}`,
        boxShadow: theme.cardShadow
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', 
            padding: '10px', 
            borderRadius: '12px' 
          }}>
            <ShieldCheck size={32} color={theme.accent} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.025em' }}>
              Lighthouse
            </h1>
            <p style={{ margin: '2px 0 0 0', color: theme.textSecondary, fontSize: '14px', fontWeight: 500 }}>
              Automated Docker Updates
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            borderRadius: '12px',
            backgroundColor: systemHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: systemHealthy ? theme.success : theme.error,
            fontWeight: 600,
            fontSize: '14px',
            border: `1px solid ${systemHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            {systemHealthy ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {systemHealthy ? 'SYSTEM HEALTHY' : 'ATTENTION REQUIRED'}
          </div>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: '10px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.surface,
              color: theme.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={() => { setLoading(true); fetchContainers(); fetchLogs(); }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              border: 'none', 
              backgroundColor: theme.accent, 
              color: 'white', 
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
            }}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} /> Sync
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {[
          { label: 'Watched', value: stats.total, icon: <Container size={22} />, color: theme.accent, bg: 'rgba(59, 130, 246, 0.1)' },
          { label: 'Running', value: stats.running, icon: <Activity size={22} />, color: theme.success, bg: 'rgba(16, 185, 129, 0.1)' },
          { label: 'Issues', value: stats.stopped, icon: <AlertCircle size={22} />, color: theme.error, bg: 'rgba(239, 68, 68, 0.1)' },
          { label: 'Engine', value: lighthouseActive ? 'Active' : 'Offline', icon: <Server size={22} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
        ].map((stat, i) => (
          <div key={i} style={{ 
            backgroundColor: theme.surface, 
            padding: '24px', 
            borderRadius: '20px', 
            border: `1px solid ${theme.border}`,
            boxShadow: theme.cardShadow,
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              backgroundColor: stat.bg, 
              color: stat.color,
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: theme.textSecondary, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px', color: theme.textPrimary }}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
        {/* Monitoring List */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Active Monitoring</h2>
            <span style={{ fontSize: '12px', color: theme.textSecondary, fontWeight: 500 }}>Live Feed</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {containers.length === 0 ? (
              <div style={{ 
                padding: '60px', 
                textAlign: 'center', 
                backgroundColor: theme.surface, 
                borderRadius: '20px', 
                border: `2px dashed ${theme.border}` 
              }}>
                <p style={{ color: theme.textSecondary, fontWeight: 500 }}>No containers detected with monitoring labels.</p>
              </div>
            ) : (
              containers.map(c => (
                <div key={c.Id} style={{ 
                  backgroundColor: theme.surface, 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: `1px solid ${theme.border}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: c.State === 'running' ? theme.success : theme.error,
                      boxShadow: c.State === 'running' ? `0 0 12px ${theme.success}66` : 'none'
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: theme.textPrimary }}>
                        {c.Names[0].replace('/', '')}
                      </div>
                      <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '2px', fontFamily: 'monospace' }}>
                        {c.Image}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: c.State === 'running' ? theme.success : theme.error,
                      backgroundColor: c.State === 'running' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-block'
                    }}>
                      {c.State.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '6px', fontWeight: 500 }}>
                      {c.Status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Logs Console */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={20} color={theme.accent} /> Engine Logs
            </h2>
          </div>
          <div style={{ 
            backgroundColor: isDarkMode ? '#020617' : '#1e293b', 
            color: '#cbd5e1', 
            padding: '24px', 
            borderRadius: '20px', 
            height: '520px', 
            overflowY: 'auto',
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            whiteSpace: 'pre-wrap',
            fontSize: '12px',
            lineHeight: '1.7',
            border: `1px solid ${theme.border}`,
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {logs ? (
              logs.split('\n').map((line, i) => (
                <div key={i} style={{ marginBottom: '4px' }}>
                  <span style={{ color: theme.accent, marginRight: '8px' }}>›</span>
                  {line}
                </div>
              ))
            ) : (
              <div style={{ color: theme.textSecondary, fontStyle: 'italic' }}>Initialising log stream...</div>
            )}
          </div>
        </section>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono&display=swap');
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.textSecondary}; }
      `}</style>
    </div>
  );
};

export default App;
