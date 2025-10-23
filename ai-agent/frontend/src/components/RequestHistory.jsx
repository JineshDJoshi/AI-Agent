import { useState, useEffect } from 'react';
import { supervisorAPI } from '../services/api';

export default function RequestHistory() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, resolved, escalated

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const response = await supervisorAPI.getRequests(status);
      setRequests(response.data.filter(r => r.status !== 'pending'));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load history:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return '#10b981';
      case 'escalated':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return '✅';
      case 'escalated':
        return '🚨';
      default:
        return '⏳';
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading request history...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Request History</h2>
        <div style={styles.filters}>
          <button
            onClick={() => setFilter('all')}
            style={filter === 'all' ? styles.filterButtonActive : styles.filterButton}
          >
            All
          </button>
          <button
            onClick={() => setFilter('resolved')}
            style={filter === 'resolved' ? styles.filterButtonActive : styles.filterButton}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('escalated')}
            style={filter === 'escalated' ? styles.filterButtonActive : styles.filterButton}
          >
            Escalated
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No requests found</p>
        </div>
      ) : (
        <div style={styles.requestsList}>
          {requests.map((request) => (
            <div key={request.id} style={styles.requestCard}>
              <div style={styles.requestHeader}>
                <div style={styles.headerLeft}>
                  <span style={styles.requestId}>#{request.id.slice(0, 8)}</span>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(request.status) + '20',
                      color: getStatusColor(request.status),
                    }}
                  >
                    {getStatusIcon(request.status)} {request.status}
                  </span>
                </div>
                <span style={styles.requestTime}>
                  {new Date(request.timestamp).toLocaleString()}
                </span>
              </div>

              <div style={styles.requestBody}>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>📞 Customer:</span>
                  <span style={styles.fieldValue}>{request.customerPhone}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>❓ Question:</span>
                  <span style={styles.fieldValue}>{request.question}</span>
                </div>
                {request.answer && (
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>💡 Answer:</span>
                    <span style={styles.fieldValue}>{request.answer}</span>
                  </div>
                )}
                {request.supervisorName && (
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>👤 Resolved By:</span>
                    <span style={styles.fieldValue}>{request.supervisorName}</span>
                  </div>
                )}
                {request.resolvedAt && (
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>⏰ Resolved At:</span>
                    <span style={styles.fieldValue}>
                      {new Date(request.resolvedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  filters: {
    display: 'flex',
    gap: '8px',
  },
  filterButton: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  filterButtonActive: {
    padding: '8px 16px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: '1px solid #4f46e5',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#6b7280',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
  },
  requestsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  requestCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '8px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  requestId: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4f46e5',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  requestTime: {
    fontSize: '13px',
    color: '#6b7280',
  },
  requestBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
  },
  fieldValue: {
    fontSize: '14px',
    color: '#111827',
  },
};

