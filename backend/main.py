
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ollama import chat, ResponseError
from knowledge import search_knowledge

app = FastAPI(
    title="Lenny Growth Assistant API",
    description="AI-powered product and growth assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


@app.get("/")
def home():
    return {"message": "Lenny Growth Assistant API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    try:
        # Search the local knowledge base.
        results = search_knowledge(request.message)

        # Refuse to answer if no relevant evidence is found.
        if not results:
            return {
                "reply": (
                    "I couldn't find relevant evidence in the current "
                    "knowledge base to answer this question reliably. "
                    "Please add relevant source material and try again."
                ),
                "sources": [],
            }

        # Prepare context for the local language model.
        context = "\n\n".join(
            f"Source: {item['source']}\n{item['content']}"
            for item in results
        )

        response = chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are the Lenny Growth Assistant. "
                        "Answer using the supplied knowledge-base context. "
                        "Do not invent facts, quotations, or sources. "
                        "If the context does not support an answer, "
                        "say that the available evidence is insufficient. "
                        "Some files may contain sample content. "
                        "Do not claim sample content comes from Lenny's "
                        "Podcast. Keep answers clear and practical.\n\n"
                        f"Knowledge-base context:\n{context}"
                    ),
                },
                {
                    "role": "user",
                    "content": request.message,
                },
            ],
        )

        # Return source metadata for the frontend.
        sources = []
        seen_filenames = set()

        for item in results:
            filename = item["source"]

            if filename in seen_filenames:
                continue

            seen_filenames.add(filename)

            source = {
                "filename": filename,
                "title": item.get("title", filename),
                "url": item.get("url", ""),
            }

            sources.append(source)

        return {
            "reply": response.message.content,
            "sources": sources,
        }

    except ResponseError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Ollama model error: {exc.error}",
        ) from exc

    except Exception as exc:
        # Log the real error in the backend terminal for debugging.
        print(f"Chat endpoint error: {exc}")

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to process the request. Check that Ollama "
                "is running, the model is available, and the "
                "knowledge base can be read."
            ),
        ) from exc