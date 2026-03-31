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
  Server
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
  const [error, setError] = useState<string | null>(null);
  const [lighthouseActive, setLighthouseActive] = useState(false);

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
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      color: '#1a1d21'
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        backgroundColor: 'white',
        padding: '20px 30px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={32} color="#007bff" /> Lighthouse Dashboard
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>Automated Docker Update Monitor</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            borderRadius: '20px',
            backgroundColor: systemHealthy ? '#e6f4ea' : '#fce8e8',
            color: systemHealthy ? '#1e7e34' : '#d93025',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            {systemHealthy ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {systemHealthy ? 'System Healthy' : 'Action Required'}
          </div>
          <button 
            onClick={() => { setLoading(true); fetchContainers(); fetchLogs(); }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              border: '1px solid #dee2e6', 
              backgroundColor: 'white', 
              color: '#1a1d21', 
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} /> Sync
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'Watched Containers', value: stats.total, icon: <Container size={24} color="#007bff" />, color: '#e7f1ff' },
          { label: 'Currently Running', value: stats.running, icon: <Activity size={24} color="#28a745" />, color: '#eafaf1' },
          { label: 'Status Issues', value: stats.stopped, icon: <AlertCircle size={24} color="#dc3545" />, color: '#fef2f2' },
          { label: 'Lighthouse Core', value: lighthouseActive ? 'Active' : 'Offline', icon: <Server size={24} color="#6f42c1" />, color: '#f3f0fd' },
        ].map((stat, i) => (
          <div key={i} style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
        {/* Container List */}
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Active Monitoring
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {containers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: '2px dashed #dee2e6' }}>
                <p style={{ color: '#6c757d' }}>No containers marked with lighthouse labels.</p>
              </div>
            ) : (
              containers.map(c => (
                <div key={c.Id} style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #f1f3f5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      backgroundColor: c.State === 'running' ? '#28a745' : '#dc3545',
                      boxShadow: c.State === 'running' ? '0 0 8px rgba(40,167,69,0.5)' : 'none'
                    }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '16px' }}>{c.Names[0].replace('/', '')}</div>
                      <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '2px' }}>{c.Image}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: c.State === 'running' ? '#28a745' : '#dc3545' }}>
                      {c.State.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#adb5bd', marginTop: '2px' }}>{c.Status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Logs */}
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={20} /> System Logs
          </h2>
          <div style={{ 
            backgroundColor: '#1a1d21', 
            color: '#e9ecef', 
            padding: '20px', 
            borderRadius: '16px', 
            height: '500px', 
            overflowY: 'auto',
            fontFamily: '"JetBrains Mono", monospace',
            whiteSpace: 'pre-wrap',
            fontSize: '13px',
            lineHeight: '1.6',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {logs || 'Waiting for log stream...'}
          </div>
        </section>
      </div>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
