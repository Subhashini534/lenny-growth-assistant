
from pathlib import Path
import re

PROJECT_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = PROJECT_DIR / "knowledge_base"

STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were",
    "to", "of", "in", "on", "for", "and", "or",
    "how", "what", "why", "can", "i", "we", "you",
    "my", "me", "it", "this", "that", "with",
    "do", "does", "should", "could", "would",
    "about", "from", "into", "your", "their", "they"
}


def tokenize(text: str) -> set[str]:
    """Convert text into useful lowercase words."""
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {word for word in words if word not in STOP_WORDS}


def search_knowledge(question: str) -> list[dict]:
    """Return up to three relevant paragraphs from local files."""
    question_terms = tokenize(question)

    if not question_terms or not KNOWLEDGE_DIR.exists():
        return []

    results = []
    files = sorted(
        list(KNOWLEDGE_DIR.glob("*.txt"))
        + list(KNOWLEDGE_DIR.glob("*.md"))
    )

    for file_path in files:
        try:
            text = file_path.read_text(encoding="utf-8-sig")
        except (OSError, UnicodeError):
            continue

        paragraphs = [
            paragraph.strip()
            for paragraph in re.split(r"\n\s*\n", text)
            if paragraph.strip()
        ]

        for paragraph in paragraphs:
            paragraph_terms = tokenize(paragraph)
            matched_terms = question_terms & paragraph_terms

            if not matched_terms:
                continue

            score = len(matched_terms) / len(question_terms)

            if score < 0.2:
                continue

            is_sample = file_path.name == "product_growth.txt"
            is_brian = file_path.name == "brian-halligan.md"

            results.append({
                "source": file_path.name,
                "title": (
                    "Product Growth (sample knowledge)"
                    if is_sample
                    else (
                        "Sequoia CEO coach: Brian Halligan"
                        if is_brian
                        else file_path.stem.replace("_", " ").replace("-", " ").title()
                    )
                ),
                "url": (
                    "https://www.youtube.com/watch?v=3UyitfSbY6c"
                    if is_brian
                    else ""
                ),
                "content": paragraph,
                "score": score,
                "is_sample": is_sample,
            })

    results.sort(key=lambda item: item["score"], reverse=True)
    return results[:3]