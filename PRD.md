# Product Requirements Document (PRD)

## Lenny Growth Assistant

### 1. Product Overview

Lenny Growth Assistant is a conversational application that helps product managers, startup founders, and growth teams explore product and growth concepts using retrieved material from a knowledge base.

### 2. Problem Statement

Product and growth advice is distributed across long podcast transcripts and articles. Finding relevant advice can take time. Users need a simple way to ask questions, receive concise answers, and trace those answers to source material.

### 3. Target Users

* Product managers
* Startup founders
* Growth professionals
* Students learning product management

### 4. User Needs

* Ask questions in natural language.
* Receive clear, practical answers.
* See the sources used to prepare an answer.
* Understand when the available evidence is insufficient.

### 5. Current Scope

Implemented:

* React chat interface.
* FastAPI chat endpoint.
* Local Ollama model integration.
* Keyword-based retrieval from local text and Markdown files.
* Source links in assistant responses.
* Basic input validation and health endpoint.

Planned or incomplete:

* Persistent, independent chat sessions using PostgreSQL.
* Cloud-provider integration and real provider switching.
* Dedicated “Ship 30 for 30” essay-writing skill.
* Secure artifact viewer for generated Markdown and HTML.
* Semantic retrieval and automated evaluation.
* Production deployment.

### 6. Success Metrics

Proposed evaluation metrics:

* Retrieval relevance: percentage of test questions retrieving a relevant passage.
* Groundedness: percentage of answers supported by cited passages.
* Citation coverage: percentage of evidence-based answers showing sources.
* Reliability: successful requests divided by total valid test requests.
* Response latency: time from submitting a question to receiving an answer.

Targets should be set after establishing a baseline using a representative evaluation dataset.

### 7. Key Assumptions

* Users have access to the application and its configured AI model.
* The knowledge base contains relevant, properly attributed material.
* Retrieved passages provide enough context to answer common questions.
* Users will verify important decisions against original sources.

### 8. Risks and Trade-offs

* **Hallucination:** the model may generate unsupported details. Mitigation: provide retrieved context and instruct the model to acknowledge insufficient evidence.
* **Retrieval quality:** keyword matching may miss relevant passages. Mitigation: evaluate queries and consider semantic search.
* **Latency:** local inference depends on hardware and model size. Mitigation: measure response time and handle timeouts.
* **Cost:** cloud inference can introduce usage costs. Mitigation: use configurable providers and document usage.
* **Privacy:** conversation data could contain sensitive information. Mitigation: minimize stored data, restrict access, and avoid logging secrets.
* **Unsafe HTML:** generated HTML can contain malicious content. Mitigation: isolate rendering and sanitize untrusted output before enabling an artifact viewer.

### 9. Acceptance Criteria

* Users can submit a non-empty question.
* The backend returns a response or a structured error.
* Answers show source links when retrieval returns source metadata.
* The application can report when relevant evidence is not found.
* Setup instructions explain the current runtime requirements.

### 10. Future Enhancements

* PostgreSQL-backed session history.
* Configurable local and cloud model providers.
* Semantic retrieval with improved chunking.
* Essay-writing skill with evidence-linked claims.
* Sandboxed artifact viewer.
* Automated tests, deployment, and response-quality evaluation.
