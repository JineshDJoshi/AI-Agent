import { useState, useEffect } from 'react';
import { supervisorAPI } from '../services/api';

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [answer, setAnswer] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    try {
      const response = await supervisorAPI.getPendingRequests();
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!answer.trim() || !supervisorName.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await supervisorAPI.resolveRequest(selectedRequest.id, answer, supervisorName);
      alert('Request resolved successfully!');
      setSelectedRequest(null);
      setAnswer('');
      setSupervisorName('');
      loadRequests();
    } catch (error) {
      console.error('Failed to resolve request:', error);
      alert('Failed to resolve request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading pending requests...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Pending Requests ({requests.length})</h2>

      {requests.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>✨</div>
          <p style={styles.emptyText}>No pending requests</p>
          <p style={styles.emptySubtext}>All caught up!</p>
        </div>
      ) : (
        <div style={styles.requestsList}>
          {requests.map((request) => (
            <div key={request.id} style={styles.requestCard}>
              <div style={styles.requestHeader}>
                <span style={styles.requestId}>#{request.id.slice(0, 8)}</span>
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
                {request.context && (
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>💬 Context:</span>
                    <span style={styles.fieldValue}>{request.context}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedRequest(request)}
                style={styles.resolveButton}
              >
                Resolve Request
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal for resolving */}
      {selectedRequest && (
        <div style={styles.modal} onClick={() => setSelectedRequest(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Resolve Request</h3>
            <div style={styles.modalBody}>
              <p style={styles.modalQuestion}>
                <strong>Question:</strong> {selectedRequest.question}
              </p>
              <form onSubmit={handleResolve}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Your Answer:</label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    style={styles.textarea}
                    rows={4}
                    placeholder="Type your answer here..."
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Your Name:</label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    style={styles.input}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    style={styles.cancelButton}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.submitButton}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '20px',
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
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: '14px',
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
  },
  requestId: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4f46e5',
  },
  requestTime: {
    fontSize: '13px',
    color: '#6b7280',
  },
  requestBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
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
  resolveButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    margin: 0,
  },
  modalBody: {
    padding: '20px',
  },
  modalQuestion: {
    fontSize: '14px',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontFamily: 'inherit',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};