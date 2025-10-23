import { useState } from 'react';
import { agentAPI } from '../services/api';

export default function TestPanel() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [customPhone, setCustomPhone] = useState('+1234567890');
  const [customMessage, setCustomMessage] = useState('');

  const testScenarios = [
    {
      name: '📍 Known Question - Office Hours',
      phone: '+1234567890',
      message: 'What are your office hours?',
      description: 'Should be answered from knowledge base',
    },
    {
      name: '❓ Unknown Question - Pricing',
      phone: '+1234567890',
      message: 'What is the cost of your premium service?',
      description: 'Should escalate to supervisor',
    },
    {
      name: '📧 Contact Information',
      phone: '+1234567890',
      message: 'How can I reach the support team?',
      description: 'Should be answered from knowledge base',
    },
  ];

  const runTest = async (phone, message) => {
    setTesting(true);
    setResult(null);

    try {
      console.log('Running test:', { phone, message });
      const response = await agentAPI.simulateCall(phone, message);
      
      setResult({
        success: true,
        data: response.data,
        timestamp: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error('Test failed:', error);
      setResult({
        success: false,
        error: error.response?.data?.error || error.message,
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCustomTest = (e) => {
    e.preventDefault();
    if (!customMessage.trim()) {
      alert('Please enter a message');
      return;
    }
    runTest(customPhone, customMessage);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧪 Test Agent</h2>
      <p style={styles.subtitle}>
        Test the AI agent's ability to answer questions and escalate to supervisors
      </p>

      {/* Pre-defined Scenarios */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Quick Test Scenarios</h3>
        <div style={styles.scenarioGrid}>
          {testScenarios.map((scenario, index) => (
            <div key={index} style={styles.scenarioCard}>
              <div style={styles.scenarioHeader}>
                <h4 style={styles.scenarioName}>{scenario.name}</h4>
              </div>
              <p style={styles.scenarioDescription}>{scenario.description}</p>
              <div style={styles.scenarioDetails}>
                <p style={styles.detailText}>
                  <strong>Phone:</strong> {scenario.phone}
                </p>
                <p style={styles.detailText}>
                  <strong>Message:</strong> {scenario.message}
                </p>
              </div>
              <button
                onClick={() => runTest(scenario.phone, scenario.message)}
                style={styles.testButton}
                disabled={testing}
              >
                {testing ? 'Testing...' : 'Run Test'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Test */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Custom Test</h3>
        <form onSubmit={handleCustomTest} style={styles.customForm}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Customer Phone:</label>
            <input
              type="text"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              style={styles.input}
              placeholder="+1234567890"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Customer Message:</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              style={styles.textarea}
              rows={3}
              placeholder="Enter a question or message..."
            />
          </div>
          <button type="submit" style={styles.submitButton} disabled={testing}>
            {testing ? 'Testing...' : 'Run Custom Test'}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Test Result</h3>
          <div
            style={{
              ...styles.resultCard,
              borderColor: result.success ? '#10b981' : '#ef4444',
            }}
          >
            <div style={styles.resultHeader}>
              <span
                style={{
                  ...styles.resultStatus,
                  backgroundColor: result.success ? '#d1fae5' : '#fee2e2',
                  color: result.success ? '#065f46' : '#991b1b',
                }}
              >
                {result.success ? '✅ Success' : '❌ Failed'}
              </span>
              <span style={styles.resultTime}>{result.timestamp}</span>
            </div>

            {result.success ? (
              <div style={styles.resultBody}>
                <div style={styles.resultField}>
                  <span style={styles.resultLabel}>Response Type:</span>
                  <span
                    style={{
                      ...styles.resultValue,
                      color:
                        result.data.responseType === 'knowledge_base'
                          ? '#10b981'
                          : '#f59e0b',
                    }}
                  >
                    {result.data.responseType === 'knowledge_base'
                      ? '📚 Knowledge Base'
                      : '👤 Escalated to Supervisor'}
                  </span>
                </div>

                {result.data.answer && (
                  <div style={styles.resultField}>
                    <span style={styles.resultLabel}>Answer:</span>
                    <span style={styles.resultValue}>{result.data.answer}</span>
                  </div>
                )}

                {result.data.requestId && (
                  <div style={styles.resultField}>
                    <span style={styles.resultLabel}>Request ID:</span>
                    <span style={styles.resultValue}>{result.data.requestId}</span>
                  </div>
                )}

                {result.data.message && (
                  <div style={styles.resultField}>
                    <span style={styles.resultLabel}>Message:</span>
                    <span style={styles.resultValue}>{result.data.message}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.resultBody}>
                <p style={styles.errorText}>Error: {result.error}</p>
              </div>
            )}
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
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '24px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
  },
  scenarioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  scenarioCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  scenarioHeader: {
    marginBottom: '12px',
  },
  scenarioName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  scenarioDescription: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '12px',
  },
  scenarioDetails: {
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '12px',
  },
  detailText: {
    fontSize: '13px',
    color: '#374151',
    margin: '4px 0',
  },
  testButton: {
    padding: '10px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: 'auto',
  },
  customForm: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontFamily: 'inherit',
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
  resultCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderLeft: '4px solid',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
  },
  resultStatus: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
  },
  resultTime: {
    fontSize: '13px',
    color: '#6b7280',
  },
  resultBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resultField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  resultLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
  },
  resultValue: {
    fontSize: '14px',
    color: '#111827',
  },
  errorText: {
    fontSize: '14px',
    color: '#dc2626',
  },
};

