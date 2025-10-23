# Frontdesk AI Agent

An AI receptionist that learns from human supervisors. When the AI doesn't know something, it asks a human, remembers the answer, and gets smarter over time.

## What It Does

- **AI Agent** answers customer questions automatically
- **Escalates** to supervisors when it doesn't know the answer
- **Learns** from supervisor responses to handle similar questions next time
- **Notifies** customers when their questions are answered

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: Firebase Firestore
- **Voice**: LiveKit (optional)

## Quick Start

### 1. Firebase Setup

Create a Firebase project and get your service account credentials from Project Settings → Service Accounts.

### 2. Backend

```bash
cd backend
npm install

# Create .env file with your Firebase credentials
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
SUPERVISOR_PHONE=+1234567890

npm start
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to use the supervisor dashboard.

## How It Works

1. Customer asks a question → AI checks knowledge base
2. If unknown → Creates help request for supervisor
3. Supervisor answers through the dashboard
4. System notifies customer and saves to knowledge base
5. Next time someone asks something similar → AI knows the answer

## Project Structure

```
frontdesk-ai-agent/
├── backend/           # Node.js API
│   ├── src/
│   │   ├── services/  # Business logic
│   │   ├── routes/    # API endpoints
│   │   └── server.js
│   └── .env
└── frontend/          # React dashboard
    └── src/
        ├── components/
        └── App.jsx
```

## Features

- 🤖 AI-powered question answering
- 📞 Human escalation system
- 🧠 Self-learning knowledge base
- 📊 Supervisor dashboard
- 📜 Request history and analytics
- ⏱️ Auto-expiring requests (30min default)

## Next Steps

For production:
- Add real voice integration with LiveKit
- Implement semantic search using embeddings
- Add authentication and authorization
- Set up proper customer notifications (SMS/Email)
- Add conversation context tracking

Built as a demonstration of human-in-the-loop AI systems.