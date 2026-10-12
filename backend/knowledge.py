
from pathlib import Path
import re

PROJECT_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = PROJECT_DIR / "knowledge_base"

# Common words that don't help identify relevant content.
STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were",
    "to", "of", "in", "on", "for", "and", "or",
    "how", "what", "why", "can", "i", "we", "you",
    "my", "me", "it", "this", "that", "with",
    "do", "does", "should", "could", "would"
}


def tokenize(text: str) -> set[str]:
    """Convert text into useful lowercase words."""
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {word for word in words if word not in STOP_WORDS}


def search_knowledge(question: str) -> list[dict]:
    """Return the three most relevant paragraphs from local text files."""
    results = []
    question_terms = tokenize(question)

    if not question_terms or not KNOWLEDGE_DIR.exists():
        return results

    files = list(KNOWLEDGE_DIR.glob("*.txt")) + list(KNOWLEDGE_DIR.glob("*.md"))
    for file_path in files:
        try:
            text = file_path.read_text(encoding="utf-8-sig")
        except OSError:
            continue

        paragraphs = [
            paragraph.strip()
            for paragraph in text.split("\n\n")
            if paragraph.strip()
        ]

        for paragraph in paragraphs:
            paragraph_terms = tokenize(paragraph)
            matched_terms = question_terms & paragraph_terms

            if matched_terms:
                
              results.append({
    "source": file_path.name,
    "title": (
        "Sequoia CEO coach: Why it’s never been easier to start a company, "
        "and never been harder to scale one | Brian Halligan (co-founder, HubSpot)"
        if file_path.name == "brian-halligan.md"
        else file_path.stem.replace("_", " ").replace("-", " ").title()
    ),
    "url": (
        "https://www.youtube.com/watch?v=3UyitfSbY6c"
        if file_path.name == "brian-halligan.md"
        else ""
    ),
    "content": paragraph,
    "score": len(matched_terms) / len(question_terms)
})

    results.sort(key=lambda item: item["score"], reverse=True)

    # Ignore weak matches instead of returning unrelated paragraphs.
    return [
        item for item in results
        if item["score"] >= 0.2
    ][:3]