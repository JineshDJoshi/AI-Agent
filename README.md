# Frontdesk AI Agent

A production-ready AI receptionist system that intelligently escalates to human supervisors when needed, learns from interactions, and improves over time.

---


## 🎯 Project Overview

This system demonstrates a complete human-in-the-loop workflow for AI agents:

1. **AI Agent** receives calls and answers known questions.
2. **Escalation** to a supervisor when AI doesn't know the answer.
3. **Supervisor** provides answers through a clean UI.
4. **Customer Notification** automatically sent with the answer.
5. **Learning** system updates the knowledge base automatically.

---

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
Backend (Node.js + Express)
    ↓
Firebase Firestore (Database)
    ↓
LiveKit (Voice Agent - Optional)
```

### Tech Stack

* **Frontend:** React 18, Vite, Axios
* **Backend:** Node.js, Express, Firebase Admin SDK
* **Database:** Firebase Firestore
* **AI Integration:** LiveKit (optional), OpenAI (optional)

---

## 📁 Project Structure

```
frontdesk-ai-agent/
├── backend/
│   ├── src/
│   │   ├── config/          # Firebase & LiveKit config
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # API routes
│   │   └── server.js        # Express server
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── index.html
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

* Node.js 18+ installed
* Firebase project created
* (Optional) LiveKit account for real voice calls

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Go to Project Settings → Service Accounts.
4. Generate a new private key.
5. Copy the credentials.

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your credentials (redacted example):

```env
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...REDACTED...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
SUPERVISOR_PHONE=+1234567890
REQUEST_TIMEOUT_MINUTES=30
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
OPENAI_API_KEY=sk-************************
```

Start the backend:

```bash
npm start
# or for development with auto-reload
npm run dev
```

Backend runs on `http://localhost:3000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## 🎮 How to Use

### 1. Test the AI Agent

1. Go to **"🧪 Test Agent"** tab.
2. Use a quick test scenario or type your own question.
3. Click **"📞 Simulate Call"**.
4. Watch the AI respond or escalate.

### 2. Handle Pending Requests

1. Go to **"⏳ Pending Requests"** tab.
2. See questions that need supervisor help.
3. Click **"Resolve"**, type your answer, and submit.
4. The system automatically:

   * Notifies the customer (simulated).
   * Adds the answer to the knowledge base.
   * Marks the request as resolved.

### 3. View Knowledge Base

1. Go to **"🧠 Knowledge Base"** tab.
2. View all learned Q&A pairs.
3. Filter by category.
4. Add manual knowledge entries or delete outdated ones.

### 4. Monitor Dashboard

1. Go to **"📊 Dashboard"** tab.
2. View statistics:

   * Total/Pending/Resolved/Expired requests.
   * Knowledge base size and categories.
   * Most used knowledge entries.

### 5. Review History

1. Go to **"📜 History"** tab.
2. Filter by status (All/Resolved/Pending/Expired).
3. Review past interactions.

---

## 🔑 Key Design Decisions

### 1. Database Schema

**Help Requests Table:**

```javascript
{
  id: string,
  customerPhone: string,
  customerQuestion: string,
  status: 'pending' | 'resolved' | 'expired',
  createdAt: timestamp,
  resolvedAt: timestamp | null,
  expiresAt: timestamp,
  supervisorAnswer: string | null,
  supervisorName: string | null,
  callId: string,
  notifiedCustomer: boolean
}
```

**Knowledge Base Table:**

```javascript
{
  id: string,
  question: string (normalized),
  answer: string,
  category: string,
  sourceRequestId: string,
  learnedAt: timestamp,
  lastUsed: timestamp,
  useCount: number,
  isActive: boolean
}
```

### 2. Request Lifecycle

```
[Created] → [Pending] → [Resolved] ✓
                    ↓
                [Expired] ✗ (after 30min)
```

### 3. Knowledge Matching

* Questions are normalized (lowercase, punctuation removed).
* Simple word overlap similarity (50%+ threshold).
* **Production upgrade:** Use embeddings (OpenAI, etc.) for semantic search.
* 
