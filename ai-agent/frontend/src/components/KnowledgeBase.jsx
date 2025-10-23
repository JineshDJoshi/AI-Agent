import { useState, useEffect } from 'react';
import { supervisorAPI } from '../services/api';

export default function KnowledgeBase() {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      const response = await supervisorAPI.getKnowledge();
      setKnowledge(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await supervisorAPI.addKnowledge(
        formData.question,
        formData.answer,
        formData.category
      );
      alert('Knowledge added successfully!');
      setFormData({ question: '', answer: '', category: 'general' });
      setShowAddForm(false);
      loadKnowledge();
    } catch (error) {
      console.error('Failed to add knowledge:', error);
      alert('Failed to add knowledge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) {
      return;
    }

    try {
      await supervisorAPI.deleteKnowledge(id);
      alert('Knowledge deleted successfully!');
      loadKnowledge();
    } catch (error) {
      console.error('Failed to delete knowledge:', error);
      alert('Failed to delete knowledge');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading knowledge base...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Knowledge Base ({knowledge.length})</h2>
        <button
          onClick={() => setShowAddForm(true)}
          style={styles.addButton}
        >
          ➕ Add Knowledge
        </button>
      </div>

      {knowledge.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📚</div>
          <p style={styles.emptyText}>No knowledge entries yet</p>
          <p style={styles.emptySubtext}>Add your first entry to get started</p>
        </div>
      ) : (
        <div style={styles.knowledgeList}>
          {knowledge.map((item) => (
            <div key={item.id} style={styles.knowledgeCard}>
              <div style={styles.knowledgeHeader}>
                <span style={styles.category}>{item.category}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={styles.deleteButton}
                >
                  🗑️
                </button>
              </div>
              <div style={styles.knowledgeBody}>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>❓ Question:</span>
                  <span style={styles.fieldValue}>{item.question}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>💡 Answer:</span>
                  <span style={styles.fieldValue}>{item.answer}</span>
                </div>
                <div style={styles.meta}>
                  <span style={styles.metaText}>
                    Added: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Knowledge Modal */}
      {showAddForm && (
        <div style={styles.modal} onClick={() => setShowAddForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Add New Knowledge</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={styles.select}
                >
                  <option value="general">General</option>
                  <option value="pricing">Pricing</option>
                  <option value="services">Services</option>
                  <option value="policies">Policies</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Question:</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  style={styles.input}
                  placeholder="Enter the question..."
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Answer:</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  style={styles.textarea}
                  rows={4}
                  placeholder="Enter the answer..."
                  required
                />
              </div>
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
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
                  {submitting ? 'Adding...' : 'Add Knowledge'}
                </button>
              </div>
            </form>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
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
  knowledgeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  knowledgeCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  knowledgeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  category: {
    padding: '4px 12px',
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    opacity: 0.7,
  },
  knowledgeBody: {
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
  meta: {
    paddingTop: '8px',
    borderTop: '1px solid #e5e7eb',
  },
  metaText: {
    fontSize: '12px',
    color: '#9ca3af',
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
  form: {
    padding: '20px',
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
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
  },
  select: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontFamily: 'inherit',
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
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

