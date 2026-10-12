
import { useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState("ollama");

  const [mode, setMode] = useState("chat");
  const [essayTopic, setEssayTopic] = useState("");
  const [essayResult, setEssayResult] = useState(null);
  const [essayLoading, setEssayLoading] = useState(false);

  const [artifactPrompt, setArtifactPrompt] = useState("");
  const [artifactFormat, setArtifactFormat] = useState("html");
  const [artifactResult, setArtifactResult] = useState(null);
  const [artifactLoading, setArtifactLoading] = useState(false);
  const [artifactError, setArtifactError] = useState("");

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
        throw new Error(data.detail || `Request failed (${response.status})`);
      }

      setMessages((previous) => {
        const updated = [...previous];
        const loadingIndex = updated.findLastIndex(
          (item) =>
            item.role === "assistant" && item.content === "Thinking..."
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
            item.role === "assistant" && item.content === "Thinking..."
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

  async function generateEssay() {
    const topic = essayTopic.trim();

    if (topic.length < 3) {
      setEssayResult({
        essay: "Please enter an essay topic with at least 3 characters.",
        sources: [],
      });
      return;
    }

    setEssayLoading(true);
    setEssayResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Request failed (${response.status})`);
      }

      setEssayResult({
        essay: data.essay,
        sources: data.sources || [],
      });
    } catch (error) {
      setEssayResult({
        essay: `Unable to generate essay: ${error.message}`,
        sources: [],
      });
    } finally {
      setEssayLoading(false);
    }
  }


  async function generateArtifact() {
    const prompt = artifactPrompt.trim();

    if (prompt.length < 3) {
      setArtifactError("Please enter a prompt with at least 3 characters.");
      return;
    }

    setArtifactLoading(true);
    setArtifactError("");
    setArtifactResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/artifact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, format: artifactFormat }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Request failed (${response.status})`);
      }

      if (typeof data.content !== "string" || !data.content.trim()) {
        throw new Error("The API returned an empty artifact.");
      }

      setArtifactResult({
        format: data.format || artifactFormat,
        content: data.content,
        title: data.title || "Generated Artifact",
      });
    } catch (error) {
      setArtifactError(`Unable to generate artifact: ${error.message}`);
    } finally {
      setArtifactLoading(false);
    }
  }

  async function copyArtifact() {
    if (!artifactResult) return;
    try {
      await navigator.clipboard.writeText(artifactResult.content);
      setArtifactError("");
    } catch {
      setArtifactError("Copy failed. Please select and copy the content manually.");
    }
  }

  function downloadArtifact() {
    if (!artifactResult) return;

    const extension = artifactResult.format === "html" ? "html" : "md";
    const mimeType =
      artifactResult.format === "html" ? "text/html" : "text/markdown";
    const blob = new Blob([artifactResult.content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lenny-artifact.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function startNewChat() {
    setMessages([]);
    setMessage("");
  }

  function selectMode(nextMode) {
    setMode(nextMode);

    if (nextMode === "essay") {
      setEssayResult(null);
    }
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

        <div className="mode-switcher">
          <p>TOOLS</p>

          <button
            className={mode === "chat" ? "mode-button active" : "mode-button"}
            onClick={() => selectMode("chat")}
          >
            💬 Chat Assistant
          </button>

          <button
            className={mode === "essay" ? "mode-button active" : "mode-button"}
            onClick={() => selectMode("essay")}
          >
            ✍️ Ship 30 for 30 Essay Writer
          </button>

          <button
            className={mode === "artifact" ? "mode-button active" : "mode-button"}
            onClick={() => selectMode("artifact")}
          >
            🧩 Artifact Viewer
          </button>
        </div>

        <div className="sidebar-bottom">
          <span>AI-powered product insights</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h3>
              {mode === "chat"
                ? "The Lenny Growth Assistant"
                : mode === "essay"
                  ? "Ship 30 for 30 Essay Writer"
                  : "Artifact Viewer"}
            </h3>
            <p>
              {mode === "chat"
                ? "Learn from product and growth experts"
                : mode === "essay"
                  ? "Turn product and growth insights into essays"
                  : "Generate Markdown documents and HTML/CSS previews"}
            </p>
          </div>

          <label className="model-select">
            Model
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
            >
              <option value="ollama">Local · Ollama</option>
              <option value="cloud" disabled>
                Cloud AI · Not configured
              </option>
            </select>
          </label>
        </header>

        {mode === "chat" ? (
          <>
            <section className="chat-area">
              {messages.length === 0 ? (
                <div className="welcome">
                  <div className="welcome-icon">✦</div>
                  <h1>Build better products.</h1>
                  <p>
                    Ask questions about product management, startups, user
                    research, and growth strategies.
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
                        setMessage("What makes a good product-market fit?")
                      }
                    >
                      What makes a good product-market fit?
                    </button>

                    <button
                      onClick={() =>
                        setMessage("How should a startup prioritize features?")
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
          </>
        ) : mode === "essay" ? (
          <section className="essay-area">
            <div className="essay-intro">
              <div className="welcome-icon">✍️</div>
              <h1>Write an essay worth sharing.</h1>
              <p>
                Choose a product or growth topic. The assistant will use
                retrieved knowledge to draft an essay with a hook, headings,
                practical takeaways, and available source links.
              </p>
            </div>

            <form
              className="essay-form"
              onSubmit={(event) => {
                event.preventDefault();
                generateEssay();
              }}
            >
              <label htmlFor="essay-topic">What do you want to write about?</label>

              <textarea
                id="essay-topic"
                value={essayTopic}
                onChange={(event) => setEssayTopic(event.target.value)}
                placeholder="Example: How can startups improve user retention?"
                rows={3}
                minLength={3}
                maxLength={500}
                required
              />

              <button
                type="submit"
                className="send-button"
                disabled={essayLoading || essayTopic.trim().length < 3}
              >
                {essayLoading ? "Writing your essay..." : "Generate Essay ✨"}
              </button>
            </form>

            {essayLoading && (
              <p className="essay-status">
                Generating your draft with the local Ollama model. This may
                take a little while.
              </p>
            )}

            {essayResult && (
              <article className="essay-result">
                <div className="essay-result-header">
                  <h2>Your Essay</h2>
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() =>
                      navigator.clipboard.writeText(essayResult.essay)
                    }
                  >
                    Copy essay
                  </button>
                </div>

                <div className="essay-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {essayResult.essay}
                  </ReactMarkdown>
                </div>

                {essayResult.sources.length > 0 && (
                  <div className="message-sources">
                    <h3>Sources used</h3>
                    <ul>
                      {essayResult.sources.map((source, index) => (
                        <li key={source.filename || source.url || index}>
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
              </article>
            )}

            <p className="disclaimer">
              Review factual claims against the original sources before
              publishing. Generated content may contain inaccuracies.
            </p>
          </section>
        ) : (
          <section className="artifact-workspace">
            <div className="artifact-panel">
              <h2>Create an artifact</h2>
              <p className="artifact-description">
                Describe a document or static web page. The local Ollama model
                will generate content for the preview.
              </p>

              <form
                className="artifact-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  generateArtifact();
                }}
              >
                <label htmlFor="artifact-format">Output format</label>
                <select
                  id="artifact-format"
                  value={artifactFormat}
                  onChange={(event) => {
                    setArtifactFormat(event.target.value);
                    setArtifactResult(null);
                    setArtifactError("");
                  }}
                >
                  <option value="html">HTML + CSS preview</option>
                  <option value="markdown">Markdown document</option>
                </select>

                <label htmlFor="artifact-prompt">What should it create?</label>
                <textarea
                  id="artifact-prompt"
                  value={artifactPrompt}
                  onChange={(event) => setArtifactPrompt(event.target.value)}
                  placeholder="Example: Create a responsive landing page for a productivity app with a hero section, three features, and a sign-up button."
                  minLength={3}
                  maxLength={4000}
                  rows={7}
                  required
                />

                <div className="artifact-actions">
                  <button
                    type="submit"
                    className="send-button"
                    disabled={artifactLoading || artifactPrompt.trim().length < 3}
                  >
                    {artifactLoading ? "Generating..." : "Generate artifact ✨"}
                  </button>

                  {artifactResult && (
                    <>
                      <button type="button" className="copy-button" onClick={copyArtifact}>
                        Copy content
                      </button>
                      <button type="button" className="copy-button" onClick={downloadArtifact}>
                        Download
                      </button>
                    </>
                  )}
                </div>
              </form>

              {artifactLoading && (
                <p className="essay-status">
                  Generating with the local Ollama model. This may take a little while.
                </p>
              )}

              {artifactError && <p className="artifact-error" role="alert">{artifactError}</p>}

              <p className="disclaimer">
                Preview generated HTML in an isolated iframe. Scripts are disabled.
                Review generated content before using it in a real product.
              </p>
            </div>

            <div className="artifact-panel">
              <h2>{artifactResult?.title || "Live preview"}</h2>
              <p className="artifact-description">
                {artifactResult
                  ? `Previewing ${artifactResult.format.toUpperCase()} output`
                  : "Your generated document or web page will appear here."}
              </p>

              <div className="artifact-preview">
                {!artifactResult ? (
                  <div className="artifact-empty">
                    <div>
                      <div className="welcome-icon">✦</div>
                      <strong>Nothing generated yet</strong>
                      <p>Enter a prompt and select Generate artifact.</p>
                    </div>
                  </div>
                ) : artifactResult.format === "html" ? (
                  
<iframe
  title="Generated HTML artifact preview"
  sandbox=""
  referrerPolicy="no-referrer"
  srcDoc={`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        *, *::before, *::after {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }
        body {
          overflow-wrap: anywhere;
        }
        img, video, canvas, svg {
          max-width: 100%;
          height: auto;
        }
        pre {
          max-width: 100%;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
      </style>
    </head>
    <body>
      ${artifactResult.content}
    </body>
    </html>
  `}
 />
                ) : (
                  <div className="essay-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {artifactResult.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;