import { useState } from 'react';
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function VoiceAgent() {
  const [agentState, setAgentState] = useState('disconnected');
  const [roomName, setRoomName] = useState('');
  const [token, setToken] = useState('');

  const startCall = async () => {
    try {
      setAgentState('connecting');
      
      const newRoomName = `call-${Date.now()}`;
      
      // Get token from your backend
      const response = await fetch('http://localhost:3000/api/agent/voice/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: '+1-555-0123',
          roomName: newRoomName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get token');
      }

      const data = await response.json();
      setRoomName(data.roomName);
      setToken(data.token);
      setAgentState('connected');
    } catch (error) {
      console.error('Failed to start call:', error);
      setAgentState('error');
      alert('Failed to connect. Make sure backend is running on port 3000');
    }
  };

  const endCall = () => {
    setAgentState('disconnected');
    setToken('');
    setRoomName('');
  };

  if (agentState === 'error') {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3>Connection Failed</h3>
          <p style={styles.errorText}>
            Could not connect to the voice agent. Please check:
          </p>
          <ul style={styles.errorList}>
            <li>Backend server is running (port 3000)</li>
            <li>Python agent.py is running</li>
            <li>LiveKit credentials are configured</li>
          </ul>
          <button onClick={() => setAgentState('disconnected')} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (agentState === 'disconnected') {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>🎤 Voice AI Agent</h2>
        <p style={styles.subtitle}>Talk to our AI receptionist</p>
        
        <div style={styles.callCard}>
          <div style={styles.phoneIcon}>📞</div>
          <h3>Start Voice Call</h3>
          <p style={styles.description}>
            Click below to start a voice conversation with our AI agent.
            The AI will answer questions about our salon services.
          </p>
          <button onClick={startCall} style={styles.startButton}>
            Start Call
          </button>
        </div>

        <div style={styles.infoBox}>
          <p><strong>💡 How it works:</strong></p>
          <ul style={styles.list}>
            <li>Click "Start Call" to connect</li>
            <li>Speak naturally to the AI agent</li>
            <li>AI will answer or escalate to supervisor</li>
            <li>Supervisor answers appear in dashboard</li>
          </ul>
        </div>

        <div style={styles.statusCheck}>
          <p><strong>⚙️ System Status:</strong></p>
          <div style={styles.statusItem}>
            <span>Backend: </span>
            <span style={styles.statusBadge}>Check Console</span>
          </div>
          <div style={styles.statusItem}>
            <span>Python Agent: </span>
            <span style={styles.statusBadge}>Should be running</span>
          </div>
        </div>
      </div>
    );
  }

  if (agentState === 'connecting') {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p>Connecting to AI agent...</p>
          <p style={styles.loadingSubtext}>Room: {roomName}</p>
        </div>
      </div>
    );
  }

  // Get LiveKit URL from environment or use default
  const livekitUrl = import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880';

  return (
    <div style={styles.container}>
      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        audio={true}
        video={false}
        onDisconnected={endCall}
        style={styles.room}
      >
        <VoiceAssistantContent onEndCall={endCall} />
      </LiveKitRoom>
    </div>
  );
}

function VoiceAssistantContent({ onEndCall }) {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div style={styles.callActive}>
      <div style={styles.callHeader}>
        <h2>🎤 Call Active</h2>
        <div style={styles.status}>
          <div style={styles.statusDot}></div>
          <span>{state === 'listening' ? 'Listening...' : state === 'speaking' ? 'Speaking...' : 'Connected'}</span>
        </div>
      </div>

      <div style={styles.visualizer}>
        <BarVisualizer
          state={state}
          barCount={5}
          trackRef={audioTrack}
        />
      </div>

      <div style={styles.instructions}>
        <p><strong>💬 You can ask about:</strong></p>
        <ul style={styles.questionList}>
          <li>Business hours and location</li>
          <li>Service prices (haircut, coloring, etc.)</li>
          <li>Contact information</li>
          <li>Appointments (will escalate to supervisor)</li>
        </ul>
      </div>

      <VoiceAssistantControlBar />
      
      <button onClick={onEndCall} style={styles.endButton}>
        End Call
      </button>

      <RoomAudioRenderer />
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '32px',
  },
  callCard: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    marginBottom: '24px',
  },
  phoneIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  description: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '24px',
  },
  startButton: {
    padding: '16px 48px',
    fontSize: '18px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(16,185,129,0.3)',
    transition: 'background-color 0.2s',
  },
  infoBox: {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  list: {
    margin: '12px 0',
    paddingLeft: '24px',
    color: '#374151',
  },
  statusCheck: {
    backgroundColor: '#eff6ff',
    padding: '20px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  statusBadge: {
    backgroundColor: '#dbeafe',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#1e40af',
  },
  loadingCard: {
    backgroundColor: '#fff',
    padding: '60px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 1s linear infinite',
  },
  loadingSubtext: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '8px',
  },
  errorCard: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  errorText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px',
  },
  errorList: {
    textAlign: 'left',
    margin: '16px auto',
    maxWidth: '400px',
    paddingLeft: '24px',
    color: '#374151',
  },
  retryButton: {
    padding: '12px 32px',
    fontSize: '16px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '16px',
  },
  room: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  callActive: {
    textAlign: 'center',
  },
  callHeader: {
    marginBottom: '24px',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6b7280',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite',
  },
  visualizer: {
    padding: '32px 0',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '24px',
    minHeight: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'left',
  },
  questionList: {
    margin: '12px 0',
    paddingLeft: '24px',
    fontSize: '14px',
    color: '#374151',
  },
  endButton: {
    padding: '12px 32px',
    fontSize: '16px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '16px',
    transition: 'background-color 0.2s',
  },
};