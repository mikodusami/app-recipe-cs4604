import { useEffect, useState } from 'react';

const Home = () => {
  const [status, setStatus] = useState('checking...');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/health')
      .then(res => res.json())
      .then(data => {
        setStatus(data.status);
        setDetails(data.details || {});
      })
      .catch(err => {
        setStatus('error');
        setDetails({ error: String(err) });
      });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Home Page</h1>

      <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Database Connection</h2>
        <p><strong>Status:</strong> {status === 'ok' ? 'Connected' : 'Not Connected'}</p>
        {details && (
          <ul>
            {'db_version' in details && <li><strong>DB Version:</strong> {details.db_version ?? 'n/a'}</li>}
            {'current_database' in details && <li><strong>Database:</strong> {details.current_database ?? 'n/a'}</li>}
            {'recipe_count' in details && <li><strong>Recipe rows:</strong> {details.recipe_count}</li>}
            {'recipe_count_error' in details && <li style={{ color: 'crimson' }}><strong>Recipe count error:</strong> {details.recipe_count_error}</li>}
            {'error' in details && <li style={{ color: 'crimson' }}><strong>Error:</strong> {details.error}</li>}
          </ul>
        )}
        <p style={{ fontSize: '0.9rem', color: '#666' }}></p>
      </div>
    </div>
  );
};

export default Home;