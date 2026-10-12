# Manual UI Test Plan — Lenny Growth Assistant

## Test Environment
- Frontend: React
- Backend: FastAPI
- Local model: Ollama (llama3.2:3b)
- Browser: Chrome

## Test Cases

| Test ID | Test | Expected Result |
|---|---|---|
| UI-01 | Open the application | Chat interface loads |
| UI-02 | Send a valid product/growth question | Assistant displays a response |
| UI-03 | Ask a question supported by the transcript | Response includes relevant source information |
| UI-04 | Ask an unsupported question | Assistant acknowledges insufficient evidence |
| UI-05 | Send a follow-up question | Assistant responds without crashing |
| UI-06 | Click New Chat | Visible messages are cleared |
| UI-07 | Disconnect Ollama and send a question | Application displays an error instead of crashing |
| UI-08 | Submit an empty message | Empty message is not accepted |

## Test Results
Record each test as PASS or FAIL after manually testing it.

## Current Limitations
- Conversations are not yet persisted in PostgreSQL.
- Cloud-model switching is not yet verified.
- Essay-writing skill and Artifact Viewer are pending implementation.
- Retrieval currently uses keyword matching rather than semantic search.
