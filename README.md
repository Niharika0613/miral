# MIRAL — AI-Powered Confidence Coach & Real-Time Communication Mirror

A full-stack, multimodal AI communication and public speaking coach that analyzes user body language, facial engagement, posture, and speech metrics in real-time, delivering supportive, actionable feedback through an intelligent mirror interface.

---

### Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Radix UI (shadcn/ui), Framer Motion, TanStack Query |
| **Computer Vision (Client-Side)** | TensorFlow.js, `@tensorflow-models/face-landmarks-detection`, `@tensorflow-models/pose-detection` |
| **Backend** | Python, FastAPI, Uvicorn, WebSockets, Pydantic, SQLAlchemy / Drizzle ORM |
| **Database** | PostgreSQL / Neon DB |
| **Speech & Audio** | Vosk, SoundFile, OpenAI Whisper API |
| **LLM Coaching Engine** | Ollama (Llama 3.2 local) / OpenAI GPT-4o-mini |

---

### System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                             MIRAL-AI PLATFORM                              │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────┐       ┌───────────────────────────┐
│             CLIENT LAYER               │       │       BACKEND LAYER       │
│        (React 18 + TypeScript)         │       │     (FastAPI Server)      │
├────────────────────────────────────────┤       ├───────────────────────────┤
│ • WebCam Video Feed & Canvas Overlay   │       │ • WebSocket Streaming Hub │
│ • TensorFlow.js Face Mesh (468 points) │──────>│ • Audio Processing Pipeline│
│ • Pose Estimation (17 Keypoints)       │  WS   │ • LLM Coaching Engine     │
│ • Real-Time Visual Feedback HUD        │<──────│   (Ollama / OpenAI)       │
│ • Interactive Practice Scenarios       │       │ • Session Metrics Store   │
└────────────────────────────────────────┘       └─────────────┬─────────────┘
                                                               │
                                                 ┌─────────────▼─────────────┐
                                                 │      DATABASE LAYER       │
                                                 │   (PostgreSQL / Neon)     │
                                                 ├───────────────────────────┤
                                                 │ • User Profiles & Auth    │
                                                 │ • Practice Sessions       │
                                                 │ • Historical Analytics    │
                                                 └───────────────────────────┘
```

---

### Key Capabilities

#### 1. Real-Time Computer Vision & Posture Tracking
- **Eye Contact Tracking**: Monitors gaze vector relative to the camera lens and calculates continuous eye-contact percentage.
- **Shoulder & Spine Alignment**: Analyzes shoulder levelness (with adjustable pixel tolerance) and spine posture to flag slumping or tilting.
- **Head Orientation**: Detects head tilts and nods to promote engaged and natural delivery.

#### 2. Speech & Voice Rhythm Analysis
- **Pacing & Cadence**: Computes real-time Words Per Minute (WPM) to help speakers maintain an optimal conversational rhythm.
- **Filler Word Detection**: Identifies repeated hesitation markers (such as "um", "uh", "like", "you know") to encourage concise speech.
- **Confidence Scoring**: Combines posture stability, eye contact ratio, and pacing into a unified session score.

#### 3. Multimodal LLM Feedback
- Generates contextual, empathetic coaching suggestions based on live biometric and verbal cues.
- Supports both **local offline inference** via Ollama (`llama3.2`) and **cloud inference** via OpenAI API.

#### 4. Practice Modes & Scenarios
- **Job Interview**: Structured behavioral and technical interview simulation.
- **Investor Pitch**: High-impact delivery practice for founder presentations.
- **Public Speaking & Keynote**: Large-audience projection and posture alignment.
- **Casual Networking**: Friendly, natural conversational pacing and active engagement.
- **Conflict Resolution & Negotiation**: Composure, steady eye contact, and measured cadence training.
- **Academic Defense**: Formal presentation and thesis defense rehearsal.

---

### Project Structure

```
MIRAL/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI widgets, navigation, HUD elements
│   │   │   └── ui/             # Radix UI primitives (shadcn)
│   │   ├── hooks/              # Custom React hooks (useWebcam, useAudioStream, useAIFeatures)
│   │   ├── lib/                # Client-side ML engines (face-detection, posture-detection)
│   │   ├── pages/              # Dashboard, Practice, Scenarios, Reports, Resources
│   │   ├── App.tsx             # Route definitions and layout
│   │   └── main.tsx            # Application entry point
│   ├── public/                 # Static branding assets
│   └── index.html              # HTML shell
├── server/                     # FastAPI Backend
│   ├── app.py                  # FastAPI application factory and middleware
│   ├── main.py                 # Server entry point
│   ├── routes.py               # REST API endpoints (users, sessions, reports)
│   ├── realtime.py             # WebSocket streaming handler
│   ├── audio_utils.py          # Audio transcription and metric computation
│   ├── ollama_service.py       # Local LLM integration
│   ├── openai_service.py       # Cloud OpenAI integration
│   ├── database.py             # Database engine configuration
│   ├── models.py               # SQLAlchemy ORM models
│   └── schemas.py              # Pydantic validation schemas
├── shared/                     # Shared TypeScript contracts and schema types
├── requirements.txt            # Python dependencies
├── package.json                # Frontend package dependencies
└── README.md                   # Project documentation
```

---

### Local Installation & Setup

#### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL database (or Neon serverless connection string)
- *(Optional)* Ollama installed locally with `llama3.2` model (`ollama run llama3.2`)

#### 1. Clone the Repository
```bash
git clone https://github.com/Niharika0613/miral.git
cd miral
```

#### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

#### 3. Backend Setup (FastAPI)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
cd server
python main.py
```
Backend API and WebSockets will start at `http://localhost:8000`.

#### 4. Frontend Setup (React + Vite)
In a separate terminal window:
```bash
# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
Access the application at `http://localhost:5000`.

---

### API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT access token |
| `GET` | `/api/sessions` | List user historical practice sessions |
| `POST` | `/api/sessions` | Create a new practice session record |
| `GET` | `/api/sessions/{id}` | Retrieve comprehensive metrics for a session |
| `POST` | `/api/analyze/feedback` | Generate LLM coaching feedback from session metrics |
| `WS` | `/ws/audio` | Real-time audio stream transcription WebSocket |

---

### License
This project is open source and available under the MIT License.
