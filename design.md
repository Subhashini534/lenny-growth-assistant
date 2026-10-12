# Design Document — Lenny Growth Assistant

## 1. Design Goals

* Make asking product and growth questions simple.
* Present answers in a readable conversational interface.
* Show source links when available.
* Prefer evidence-based responses over unsupported claims.
* Keep the initial implementation easy to run locally.

## 2. User Interface

### Sidebar

* Application name: Lenny AI.
* New Chat button to clear the current conversation.
* Workspace labels for conversation history, growth strategies, and writing assistance.

### Header

* Application title and short description.
* Model selector showing local Ollama and a cloud option.

**Current limitation:** The model selector changes the displayed selection, but the backend currently uses Ollama regardless of the selection.

### Chat Area

* Displays user questions and assistant responses.
* Uses Markdown rendering for headings, lists, and formatted text.
* Displays clickable source titles when source URLs are available.
* Shows a welcome screen with example questions before a conversation begins.

### Message Composer

* Text area for entering questions.
* Send button for submitting a request.
* Enter submits a question; Shift+Enter adds a new line.

## 3. Request Flow

1. The user submits a question in the React interface.
2. The frontend sends a JSON request to the FastAPI `/api/chat` endpoint.
3. The backend validates the question.
4. The knowledge retrieval module searches local text and Markdown files.
5. Retrieved passages are supplied to the Ollama model as context.
6. The backend returns the answer and available source metadata.
7. The frontend renders the answer and source links.

## 4. Retrieval Design

The current retrieval implementation uses keyword overlap:

* Tokenize the question and document paragraphs.
* Compare the question terms with each paragraph.
* Rank matching paragraphs by the proportion of question terms found.
* Return up to three qualifying results.

This is a lightweight baseline. It does not use embeddings or a vector database, and its ranking may miss relevant passages or return incomplete context.

## 5. Model and Grounding

The backend currently uses the `llama3.2:3b` Ollama model. Retrieved passages are included in the system context, and the model is instructed not to invent facts or sources.

When retrieval returns no relevant passages, the backend responds that it could not find sufficient evidence.

These controls reduce risk but do not guarantee that every answer is accurate. Users should verify important claims against original sources.

## 6. Error Handling

* Validate empty or oversized questions.
* Return an HTTP error if the model cannot process the request.
* Provide a readable error message in the chat interface.
* Expose a basic health endpoint for checking backend availability.

## 7. Security and Privacy

* Keep API keys and credentials out of source control.
* Treat retrieved content as untrusted input.
* Do not render arbitrary generated HTML as trusted application content.
* If an artifact viewer is added, isolate HTML rendering and apply appropriate sanitization.
* Add authentication and access controls before storing sensitive user data.

## 8. Known Limitations

* No PostgreSQL-backed conversation persistence yet.
* No working cloud-provider integration or automatic fallback.
* No dedicated essay-writing skill yet.
* No implemented artifact viewer yet.
* No semantic vector retrieval yet.
* Production deployment and comprehensive automated tests remain future work.
