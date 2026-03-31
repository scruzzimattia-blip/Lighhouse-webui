import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Terminal, RefreshCw, AlertCircle } from 'lucide-react';

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

  const fetchContainers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/containers');
      setContainers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch containers');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/lighthouse/logs');
      setLogs(response.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  useEffect(() => {
    fetchContainers();
    fetchLogs();
    const interval = setInterval(() => {
      fetchContainers();
      fetchLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>Lighthouse WebUI</h1>
        <button 
          onClick={() => { setLoading(true); fetchContainers(); fetchLogs(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: '6px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: '#ffdede', color: '#a30000', padding: '15px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <section>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Container size={24} /> Watched Containers
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {containers.length === 0 ? (
                <p>No containers found with label com.lighthouse.enable=true</p>
              ) : (
                containers.map(c => (
                  <div key={c.Id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{c.Names[0].replace('/', '')}</div>
                    <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>{c.Image}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.8em', 
                        backgroundColor: c.State === 'running' ? '#d4edda' : '#f8d7da',
                        color: c.State === 'running' ? '#155724' : '#721c24'
                      }}>
                        {c.State}
                      </span>
                      <span style={{ fontSize: '0.8em', color: '#888' }}>{c.Status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={24} /> Lighthouse Logs
          </h2>
          <div style={{ 
            backgroundColor: '#2b2b2b', 
            color: '#f0f0f0', 
            padding: '15px', 
            borderRadius: '8px', 
            height: '500px', 
            overflowY: 'auto',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            fontSize: '0.85em'
          }}>
            {logs || 'No logs available or Lighthouse container not found.'}
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
