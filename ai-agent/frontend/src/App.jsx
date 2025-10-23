import { useState } from 'react';
import Dashboard from './components/Dashboard';
import PendingRequests from './components/PendingRequests';
import RequestHistory from './components/RequestHistory';
import KnowledgeBase from './components/KnowledgeBase';
import TestPanel from './components/TestPanel';
import VoiceAgent from './components/VoiceAgent'; // NEW

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', component: Dashboard },
    { id: 'pending', label: '⏳ Pending Requests', component: PendingRequests },
    { id: 'history', label: '📜 History', component: RequestHistory },
    { id: 'voice', label: '🎤 Voice Agent', component: VoiceAgent }, // NEW
    { id: 'knowledge', label: '🧠 Knowledge Base', component: KnowledgeBase },
    { id: 'test', label: '🧪 Test Agent', component: TestPanel },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>Frontdesk AI Agent</h1>
          <p style={styles.tagline}>Human-in-the-Loop System</p>
        </div>
      </header>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? styles.navButtonActive : styles.navButton}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.mainContent}>
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>
            Built for Frontdesk • Supervisor Dashboard v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    padding: '20px 0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  logo: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  tagline: {
    fontSize: '14px',
    margin: '4px 0 0 0',
    opacity: 0.9,
  },
  nav: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    gap: '4px',
    overflowX: 'auto',
  },
  navButton: {
    padding: '12px 20px',
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  navButtonActive: {
    padding: '12px 20px',
    backgroundColor: 'transparent',
    color: '#4f46e5',
    border: 'none',
    borderBottom: '2px solid #4f46e5',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  main: {
    flex: 1,
    padding: '20px 0',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footer: {
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb',
    padding: '16px 0',
    marginTop: 'auto',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
};