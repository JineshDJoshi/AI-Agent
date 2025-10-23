import { useState, useEffect } from 'react';
import { supervisorAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    escalated: 0,
    avgResponseTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await supervisorAPI.getStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  const statCards = [
    { label: 'Total Requests', value: stats.total, color: '#3b82f6', icon: '📊' },
    { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: '⏳' },
    { label: 'Resolved', value: stats.resolved, color: '#10b981', icon: '✅' },
    { label: 'Escalated', value: stats.escalated, color: '#ef4444', icon: '🚨' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Dashboard Overview</h2>
        <button onClick={loadStats} style={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      <div style={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} style={styles.statCard}>
            <div style={styles.statIcon}>{card.icon}</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>{card.label}</div>
              <div style={{ ...styles.statValue, color: card.color }}>
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>⚡ System Status</h3>
        <p style={styles.infoText}>All systems operational</p>
        <p style={styles.infoSubtext}>
          Average Response Time: {stats.avgResponseTime} seconds
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    fontSize: '32px',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px',
  },
  infoText: {
    fontSize: '14px',
    color: '#10b981',
    marginBottom: '4px',
  },
  infoSubtext: {
    fontSize: '13px',
    color: '#6b7280',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#6b7280',
  },
  error: {
    padding: '20px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    margin: '20px',
  },
};

