
from knowledge import search_knowledge, tokenize


def test_tokenize_removes_common_words():
    words = tokenize("How can executives improve recruiting?")
    assert "executives" in words
    assert "recruiting" in words
    assert "how" not in words


def test_search_finds_relevant_transcript():
    results = search_knowledge("executives recruiting interviewing")
    assert len(results) > 0


def test_search_returns_no_results_for_empty_question():
    results = search_knowledge("")
    assert results == []