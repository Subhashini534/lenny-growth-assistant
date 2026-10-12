
import { useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState("ollama");

  async function sendMessage() {
    const question = message.trim();
    if (!question) return;

    setMessage("");

    setMessages((previous) => [
      ...previous,
      { role: "user", content: question },
      { role: "assistant", content: "Thinking..." },
    ]);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || `Request failed (${response.status})`
        );
      }

      setMessages((previous) => {
        const updated = [...previous];

        const loadingIndex = updated.findLastIndex(
          (item) =>
            item.role === "assistant" &&
            item.content === "Thinking..."
        );

        if (loadingIndex !== -1) {
          updated[loadingIndex] = {
            role: "assistant",
            content: data.reply,
            sources: data.sources || [],
          };
        }

        return updated;
      });
    } catch (error) {
      setMessages((previous) => {
        const updated = [...previous];

        const loadingIndex = updated.findLastIndex(
          (item) =>
            item.role === "assistant" &&
            item.content === "Thinking..."
        );

        if (loadingIndex !== -1) {
          updated[loadingIndex] = {
            role: "assistant",
            content: `Unable to get a response: ${error.message}`,
          };
        }

        return updated;
      });
    }
  }

  function startNewChat() {
    setMessages([]);
    setMessage("");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Lenny AI</h2>
        <p className="subtitle">Growth Assistant</p>

        <button className="new-chat" onClick={startNewChat}>
          + New chat
        </button>

        <div className="sidebar-info">
          <p>YOUR WORKSPACE</p>
          <span>Conversation history</span>
          <span>Growth strategies</span>
          <span>Writing assistant</span>
        </div>

        <div className="sidebar-bottom">
          <span>AI-powered product insights</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h3>The Lenny Growth Assistant</h3>
            <p>Learn from product and growth experts</p>
          </div>

          <label className="model-select">
            Model
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
            >
              <option value="ollama">Local · Ollama</option>
              <option value="cloud">Cloud AI</option>
            </select>
          </label>
        </header>

        <section className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">✦</div>
              <h1>Build better products.</h1>
              <p>
                Ask questions about product management, startups,
                user research, and growth strategies.
              </p>

              <div className="suggestions">
                <button
                  onClick={() =>
                    setMessage(
                      "How can a startup improve user retention?"
                    )
                  }
                >
                  How can a startup improve user retention?
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "What makes a good product-market fit?"
                    )
                  }
                >
                  What makes a good product-market fit?
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "How should a startup prioritize features?"
                    )
                  }
                >
                  How should a startup prioritize features?
                </button>
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((item, index) => (
                <div className="message" key={index}>
                  <strong>
                    {item.role === "user" ? "You" : "Assistant"}
                  </strong>

                  <div className="message-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.content}
                    </ReactMarkdown>
                  </div>

                  {item.role === "assistant" &&
                    item.sources?.length > 0 && (
                      <div className="message-sources">
                        <strong>Sources:</strong>
                        <ul>
                          {item.sources.map((source, sourceIndex) => (
                            <li
                              key={
                                source.filename ||
                                source.url ||
                                sourceIndex
                              }
                            >
                              {source.url ? (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {source.title || source.filename}
                                </a>
                              ) : (
                                source.title || source.filename
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="composer-area">
          <div className="composer">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask a product or growth question..."
              rows={2}
            />

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={!message.trim()}
            >
              Send ↑
            </button>
          </div>

          <p className="disclaimer">
            Verify important decisions against cited source material.
            AI-generated answers may be inaccurate.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;