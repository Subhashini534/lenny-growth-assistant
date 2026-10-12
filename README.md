# Lenny Growth Assistant

An AI-powered product and growth assistant that answers questions using retrieved transcript content from the knowledge base.

## Features

* Conversational interface built with React.
* FastAPI backend for chat requests.
* Local language model integration using Ollama (`llama3.2:3b`).
* Keyword-based knowledge retrieval.
* Answers include source links when available.
* Markdown rendering for readable responses.
* Basic health endpoint and API request validation.
* Evidence-aware responses when relevant material is not found.

## Technology Stack

* Frontend: React, Vite, ReactMarkdown
* Backend: Python, FastAPI, Uvicorn
* AI model: Ollama, `llama3.2:3b`
* Knowledge base: Local text and Markdown files

## Project Structure

```text
lenny-growth-assistant/
├── backend/
│   ├── main.py
│   ├── knowledge.py
│   └── venv/
├── knowledge_base/
├── .env.example
├── README.md
└── lenny-growth-assistant/
    └── frontend/
        └── src/
            ├── App.jsx
            ├── App.css
            └── main.jsx
```

## Prerequisites

* Python 3.11 or compatible version
* Node.js and npm
* Ollama installed
* The `llama3.2:3b` model downloaded

## Run the Backend

Open a terminal:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

Backend API: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

Health check: http://127.0.0.1:8000/health

## Run the Frontend

Open a second terminal from the project root:

```powershell
cd .\lenny-growth-assistant\frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173/.

## Configuration

See `.env.example` for the planned configuration variables. The current backend uses a locally configured Ollama model; cloud-provider switching and PostgreSQL persistence are not yet implemented.

## Current Limitations

* Retrieval uses keyword matching rather than semantic vector search.
* Conversation history is held in frontend memory and is not persisted to PostgreSQL.
* Cloud AI selection in the interface does not yet switch the backend provider.
* The writing skill and isolated artifact viewer require further implementation.
* Automated tests and production deployment remain to be completed.

## Data Attribution

Knowledge-base material should retain its original attribution and be used according to the source repository's license and terms. Sample content must not be represented as a genuine podcast transcript.

## Security

Do not commit API keys, passwords, database credentials, or other secrets. Review source-data licensing before publishing the repository.
