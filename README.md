# 🎙️ Voice2Action AI

> Convert voice recordings into transcripts, AI-generated summaries, key points, action items, decisions, and saved notes.

Voice2Action AI is a full-stack web application built with **React + Vite**, **Node.js + Express**, **MongoDB Atlas**, and AI-powered speech processing.

The application allows a user to upload an audio recording, send it to the backend, transcribe the audio, generate structured results, and save the result as a note.

---

## 🌐 Live Project

### Frontend
https://voice2action-sooty.vercel.app

### Backend
https://voice2action-n302.onrender.com

### GitHub
https://github.com/jaswanthramadasappa-lab/voice2action

---

# 📌 Features

- 🎵 Upload audio files
- 🎙️ Speech-to-text transcription
- 🧠 AI summary generation
- 📋 Key points extraction
- ✅ Action item detection
- 📌 Priority classification
- 💡 Decision detection
- 💾 Save notes
- 📚 View saved notes/history
- 🗑️ Delete saved notes
- ☁️ MongoDB Atlas cloud database
- 🚀 Vercel frontend deployment
- 🚀 Render backend deployment
- 🔐 Environment-variable based configuration

---

# 🏗️ Project Architecture

```text
                         VOICE2ACTION AI
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
          React + Vite                  Node + Express
             Frontend                     Backend
             Vercel                      Render
                │                           │
                │       REST API            │
                └──────────────────────────►│
                                            │
                           ┌────────────────┼────────────────┐
                           │                │                │
                           ▼                ▼                ▼
                      Audio Upload     Transcription    AI Summary
                           │                │                │
                           │                ▼                │
                           │          OpenAI / Mock AI       │
                           │                                 │
                           └───────────────┬─────────────────┘
                                           │
                                           ▼
                                      MongoDB Atlas
                                      Saved Notes
```

---

# 📂 Project Structure

```text
voice2action/
│
├── client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioUploader.jsx
│   │   │   ├── AIResults.jsx
│   │   │   └── ...
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   ├── audioService.js
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── models/
│   │   └── Note.js
│   │
│   ├── routes/
│   │   ├── audioRoutes.js
│   │   ├── transcriptionRoutes.js
│   │   ├── summaryRoutes.js
│   │   └── notesRoutes.js
│   │
│   ├── uploads/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

# 🛠️ Technologies Used

## Frontend

- React
- Vite
- JavaScript
- HTML
- CSS
- Fetch API

## Backend

- Node.js
- Express.js
- CORS
- Multer / file upload handling
- dotenv

## Database

- MongoDB Atlas
- Mongoose

## AI

- OpenAI API for speech transcription
- Mock AI mode for development/testing

## Deployment

- Vercel — frontend
- Render — backend
- MongoDB Atlas — database

---

# 🚀 Complete Setup From Scratch

## 1. Prerequisites

Install:

- Node.js
- npm
- Git
- MongoDB Atlas account
- OpenAI API key if using real transcription

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

Check Git:

```bash
git --version
```

---

# 2. Clone the Repository

```bash
git clone https://github.com/jaswanthramadasappa-lab/voice2action.git
```

Enter the project:

```bash
cd voice2action
```

---

# 3. Install Frontend Dependencies

```bash
cd client
npm install
```

Run frontend:

```bash
npm run dev
```

Vite normally starts at:

```text
http://localhost:5173
```

If port 5173 is already occupied, Vite may automatically use another port such as:

```text
http://localhost:5174
```

---

# 4. Install Backend Dependencies

Open another terminal.

```bash
cd voice2action/server
npm install
```

If PowerShell blocks `npm.ps1`, use:

```bash
npm.cmd install
```

and:

```bash
npm.cmd start
```

---

# 5. MongoDB Atlas Setup

## Create a MongoDB Atlas account

Go to MongoDB Atlas and create an account.

Create:

```text
Organization
   ↓
Project
   ↓
Cluster
```

For learning/development, the **Free** cluster is sufficient.

---

# 6. Create Database User

In MongoDB Atlas:

```text
Security
   ↓
Database Access
   ↓
Add Database User
```

Create a username and password.

Example:

```text
Username:
jaswanthramadasappa_db_user

Password:
YOUR_DATABASE_PASSWORD
```

Do not put your real password in GitHub.

---

# 7. Allow Your IP Address

Go to:

```text
Security
   ↓
Network Access
   ↓
IP Access List
```

For local development, add your current IP.

For temporary development/testing, MongoDB Atlas also provides:

```text
0.0.0.0/0
```

This allows connections from any IP and should be used cautiously. For a real production application, restrict access as much as possible.

---

# 8. Get MongoDB Connection String

In MongoDB Atlas:

```text
Database
   ↓
Clusters
   ↓
Connect
   ↓
Drivers
   ↓
Node.js
```

Copy the connection string.

It will look similar to:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?appName=Voice2Action
```

For this project, a database name can be included:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/voice2action?appName=Voice2Action
```

Replace:

```text
USERNAME
```

with your MongoDB database username.

Replace:

```text
PASSWORD
```

with your database password.

Do not share this connection string publicly.

---

# 9. Backend Environment Variables

Inside:

```text
server/
```

create:

```text
.env
```

Example:

```env
NODE_ENV=production

PORT=5000

MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/voice2action?appName=Voice2Action

OPENAI_API_KEY=YOUR_OPENAI_API_KEY

USE_MOCK_AI=false

JWT_SECRET=YOUR_LONG_RANDOM_SECRET

CREDENTIAL_ENCRYPTION_KEY=YOUR_LONG_RANDOM_ENCRYPTION_KEY

CLIENT_URL=http://localhost:5173
```

### Important

Do not commit `.env`.

Your `.gitignore` should contain:

```gitignore
.env
.env.*
node_modules/
uploads/
dist/
```

---

# 🔑 Environment Variables Explained

## NODE_ENV

```env
NODE_ENV=production
```

Tells the backend that it is running in production mode.

For local development you can use:

```env
NODE_ENV=development
```

---

## PORT

```env
PORT=5000
```

The backend listens on port 5000 locally.

---

## MONGODB_URI

MongoDB Atlas connection string.

Example format:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/voice2action
```

Never publish the real value.

---

## OPENAI_API_KEY

Used when real OpenAI transcription is enabled.

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

Keep this secret.

---

## USE_MOCK_AI

For testing without consuming AI API credits:

```env
USE_MOCK_AI=true
```

For real transcription:

```env
USE_MOCK_AI=false
```

---

## JWT_SECRET

A long random secret used by applications that implement JWT authentication.

Example:

```env
JWT_SECRET=replace-with-a-long-random-secret
```

Do not use an easy password.

---

## CREDENTIAL_ENCRYPTION_KEY

A long random secret intended for encrypting sensitive application credentials when the application's credential-encryption functionality is used.

Example:

```env
CREDENTIAL_ENCRYPTION_KEY=replace-with-a-long-random-secret
```

Keep this private.

---

## CLIENT_URL

Local:

```env
CLIENT_URL=http://localhost:5173
```

Production:

```env
CLIENT_URL=https://voice2action-sooty.vercel.app
```

---

# 10. Start the Backend

From:

```text
voice2action/server
```

run:

```bash
npm start
```

If PowerShell blocks npm:

```bash
npm.cmd start
```

Expected output:

```text
Voice2Action AI Backend
Server running on http://localhost:5000
MongoDB connected
```

---

# 11. Backend API Endpoints

## Health Check

```http
GET /api/health
```

Local:

```text
http://localhost:5000/api/health
```

Production:

```text
https://voice2action-n302.onrender.com/api/health
```

Expected:

```json
{
  "status": "ok",
  "service": "Voice2Action AI backend"
}
```

---

## Upload Audio

```http
POST /api/audio/upload
```

The frontend sends the audio file using `multipart/form-data`.

---

## Transcribe Audio

```http
POST /api/transcription/transcribe
```

Request:

```json
{
  "filename": "audio-file-name.webm"
}
```

Response:

```json
{
  "success": true,
  "text": "Transcript text..."
}
```

---

## Generate Summary

```http
POST /api/summary/generate
```

Request:

```json
{
  "transcript": "Meeting transcript..."
}
```

Response structure:

```json
{
  "success": true,
  "summary": "Summary...",
  "keyPoints": [
    "Point one",
    "Point two"
  ],
  "actionItems": [
    {
      "task": "Complete the project",
      "priority": "High"
    }
  ],
  "decisions": [
    "Decision..."
  ]
}
```

---

## Save Note

```http
POST /api/notes/save
```

Request:

```json
{
  "transcript": "Transcript...",
  "result": {
    "summary": "Summary...",
    "keyPoints": [],
    "actionItems": [],
    "decisions": []
  }
}
```

---

## Get Notes

```http
GET /api/notes
```

---

## Delete Note

```http
DELETE /api/notes/:id
```

---

# 🧠 How the Application Works

## Step 1 — Audio Upload

The user selects:

```text
MP3
WAV
M4A
WebM
```

The React frontend sends the file to:

```text
POST /api/audio/upload
```

---

## Step 2 — File Storage

The Express backend receives the audio file and stores it temporarily in the server's upload directory.

---

## Step 3 — Transcription

The frontend sends the uploaded filename to:

```text
POST /api/transcription/transcribe
```

The backend either:

### Real AI mode

Uses OpenAI transcription.

or:

### Mock mode

Returns a predefined transcript for testing.

---

## Step 4 — AI Results

The transcript is sent to:

```text
POST /api/summary/generate
```

The backend creates:

```text
Summary
Key Points
Action Items
Priorities
Decisions
```

---

## Step 5 — Save Note

The user can save the generated result.

The frontend sends the data to:

```text
POST /api/notes/save
```

The backend stores it in MongoDB Atlas.

---

## Step 6 — History

The application requests:

```text
GET /api/notes
```

MongoDB returns saved notes.

The frontend displays the notes/history.

---

# 🗄️ MongoDB Data Model

The application uses a `Note` model.

Conceptually:

```text
Note
├── transcript
├── result
│   ├── summary
│   ├── keyPoints[]
│   ├── actionItems[]
│   │   ├── task
│   │   └── priority
│   └── decisions[]
├── createdAt
└── updatedAt
```

---

# 🌍 Production Deployment

## Backend — Render

Create a Render Web Service connected to the GitHub repository.

Repository:

```text
jaswanthramadasappa-lab/voice2action
```

Set the backend root directory to:

```text
server
```

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Add production environment variables in Render.

Important:

```env
NODE_ENV=production
MONGODB_URI=YOUR_MONGODB_URI
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
USE_MOCK_AI=false
JWT_SECRET=YOUR_JWT_SECRET
CREDENTIAL_ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY
CLIENT_URL=https://YOUR-VERCEL-DOMAIN
```

Do not upload `.env` to GitHub.

---

# 🎨 Frontend — Vercel

Create a Vercel project from the GitHub repository.

Set:

```text
Root Directory:
client
```

Framework:

```text
Vite
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

For production API communication, the frontend uses:

```text
https://voice2action-n302.onrender.com
```

A cleaner configuration is to define:

```env
VITE_API_URL=https://voice2action-n302.onrender.com
```

in Vercel Environment Variables.

Then the frontend service can use:

```js
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://voice2action-n302.onrender.com";
```

After changing environment variables, redeploy the frontend.

---

# 🔄 Deployment Workflow

Whenever you modify the project:

```bash
git status
```

Then:

```bash
git add .
```

Commit:

```bash
git commit -m "Update Voice2Action"
```

Push:

```bash
git push origin main
```

Then:

```text
GitHub
   ↓
Vercel
   ↓
Frontend deployment
```

For the backend:

```text
GitHub
   ↓
Render
   ↓
Backend deployment
```

---

# 🧪 Local Testing Checklist

Start backend:

```bash
cd server
npm start
```

Start frontend in another terminal:

```bash
cd client
npm run dev
```

Then test:

```text
☐ Website opens
☐ Audio file can be selected
☐ Audio upload works
☐ Transcription works
☐ AI summary works
☐ Key points appear
☐ Action items appear
☐ Decisions appear
☐ Save Note works
☐ History loads
☐ Delete Note works
```

---

# 🚨 Common Problems and Fixes

## 1. PowerShell says npm.ps1 cannot be loaded

Use:

```bash
npm.cmd install
```

or:

```bash
npm.cmd start
```

---

## 2. Port 5173 is already in use

Vite automatically chooses another port.

For example:

```text
Local: http://localhost:5174/
```

Open that URL.

---

## 3. MongoDB authentication failed

Check:

- MongoDB username
- MongoDB password
- Database user permissions
- `MONGODB_URI`
- Special characters in password
- IP Access List

If your password contains characters such as:

```text
@
:
/
?
#
%
```

they may need URL encoding inside the MongoDB URI.

---

## 4. MongoDB connection timeout

Check MongoDB Atlas:

```text
Security
→ Network Access
→ IP Access List
```

Make sure your current IP is allowed.

---

## 5. Vercel gives an API/JSON error

Check that the frontend is calling:

```text
https://voice2action-n302.onrender.com
```

and not:

```text
http://localhost:5000
```

Production frontend code must never depend on your local backend.

---

## 6. Vercel build says a function is not exported

Example:

```text
"generateSummary" is not exported
```

Make sure `audioService.js` exports:

```js
export async function uploadAudio() {}
export async function transcribeAudio() {}
export async function generateSummary() {}
export async function saveNote() {}
export async function getNotes() {}
export async function deleteNote() {}
```

---

## 7. Render says OpenAI credentials are missing

Add this environment variable in Render:

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

If you intentionally want to test without OpenAI:

```env
USE_MOCK_AI=true
```

---

# 🔐 Security Rules

Never commit:

```text
.env
.env.local
MongoDB passwords
OpenAI API keys
JWT secrets
Encryption keys
```

Never put secrets in React frontend code.

Frontend variables beginning with:

```text
VITE_
```

are exposed to the browser, so **do not put private secrets in them**.

Only public configuration such as an API base URL should use `VITE_`.

---

# 📊 Development vs Production

## Development

```text
React
localhost:5173

       ↓

Express
localhost:5000

       ↓

MongoDB Atlas
```

You can use:

```env
USE_MOCK_AI=true
```

to avoid consuming OpenAI API credits during testing.

---

## Production

```text
Vercel
Frontend
   │
   ▼
Render
Backend
   │
   ├── OpenAI
   │
   ▼
MongoDB Atlas
```

Use:

```env
USE_MOCK_AI=false
```

when real transcription is required and your OpenAI API key has available credits.

---

# 💰 API Credit Consideration

Real AI transcription can consume API credits depending on the model and usage.

For development/testing:

```env
USE_MOCK_AI=true
```

For the final live demonstration:

```env
USE_MOCK_AI=false
```

Make sure the required API access/credits are available before the final demonstration.

---

# 🎯 Recommended Final Testing

Before submitting the project:

### Local

```text
Frontend → Backend → MongoDB
```

Test everything.

### Production

Open the live Vercel website and test:

```text
Upload
   ↓
Transcribe
   ↓
Generate Results
   ↓
Save Note
   ↓
History
   ↓
Delete
```

Test once using an incognito/private browser window as well.

---

# 📤 NxtWave / Internship Submission

Keep these ready:

### Live Application

```text
https://voice2action-sooty.vercel.app
```

### GitHub Repository

```text
https://github.com/jaswanthramadasappa-lab/voice2action
```

### Backend

```text
https://voice2action-n302.onrender.com
```

---

# 📝 Project Description

**Voice2Action AI** is an AI-powered voice productivity application that converts audio recordings into useful structured information. Users can upload voice recordings, transcribe them, generate summaries, identify key points, extract action items with priorities, detect decisions, and save the results as notes. The application uses a React frontend, Node.js/Express backend, MongoDB Atlas for persistent storage, and AI-based speech processing.

---

# 💼 Resume Description

### Voice2Action AI — AI Voice Productivity Platform

- Developed a full-stack voice-to-action application using React, Node.js, Express, and MongoDB Atlas.
- Implemented audio upload and speech-to-text transcription workflows with AI integration.
- Built structured AI result generation for summaries, key points, action items, priorities, and decisions.
- Implemented MongoDB-backed note saving, history retrieval, and deletion.
- Deployed the frontend on Vercel and backend on Render with production environment configuration.

---

# 🏆 Key Learning Outcomes

Through this project, the following concepts are demonstrated:

- React component architecture
- React state management
- REST API integration
- Express routing
- File upload handling
- Async/await
- JSON APIs
- Environment variables
- MongoDB Atlas
- Mongoose schemas
- CRUD operations
- AI API integration
- Mock API development
- CORS configuration
- Git and GitHub
- Vercel deployment
- Render deployment
- Production debugging

---

# 👨‍💻 Author

**R. Jaswanth**

B.Tech CSE Student

Madanapalle Institute of Technology and Science

---

# ⭐ Final Project Flow

```text
                 USER
                  │
                  ▼
          Upload Audio File
                  │
                  ▼
            React Frontend
                  │
                  ▼
          Express REST API
                  │
                  ▼
           Audio Processing
                  │
                  ▼
          Speech Transcription
                  │
                  ▼
           AI Result Generation
                  │
          ┌───────┼────────┐
          ▼       ▼        ▼
       Summary  Actions  Decisions
          │       │        │
          └───────┼────────┘
                  ▼
             Save Note
                  │
                  ▼
            MongoDB Atlas
                  │
                  ▼
              History
```

---

# 🚀 Status

**Project Status: Completed and Deployed**

- ✅ Frontend working
- ✅ Backend working
- ✅ MongoDB connected
- ✅ Audio upload working
- ✅ Transcription working
- ✅ AI results working
- ✅ Notes working
- ✅ Production deployment working
