import json
import math
import os
import re
import uuid
from collections import Counter
from dataclasses import dataclass
from typing import Dict, List

from pypdf import PdfReader
from docx import Document

from app.config import settings


@dataclass
class KnowledgeChunk:
    id: str
    doc_id: str
    text: str


def _ensure_storage() -> None:
    os.makedirs(settings.kb_path, exist_ok=True)
    index_path = os.path.join(settings.kb_path, "index.json")
    if not os.path.exists(index_path):
        with open(index_path, "w", encoding="utf-8") as handle:
            json.dump({"documents": [], "chunks": []}, handle)


def _load_index() -> dict:
    _ensure_storage()
    index_path = os.path.join(settings.kb_path, "index.json")
    with open(index_path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _save_index(index: dict) -> None:
    index_path = os.path.join(settings.kb_path, "index.json")
    with open(index_path, "w", encoding="utf-8") as handle:
        json.dump(index, handle, ensure_ascii=False, indent=2)


def _chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    cleaned = " ".join(text.split())
    chunks: List[str] = []
    start = 0
    while start < len(cleaned):
        end = min(len(cleaned), start + chunk_size)
        chunks.append(cleaned[start:end])
        start = end - overlap
        if start < 0:
            start = 0
        if end == len(cleaned):
            break
    return [chunk for chunk in chunks if chunk.strip()]


def _extract_text(file_path: str, filename: str) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        reader = PdfReader(file_path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if lower.endswith(".docx"):
        doc = Document(file_path)
        return "\n".join(paragraph.text for paragraph in doc.paragraphs)
    if lower.endswith((".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff")):
        try:
            from PIL import Image
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError("Image OCR requires pillow. Install pillow and tesseract.") from exc
        try:
            import pytesseract
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError("Image OCR requires pytesseract and tesseract.") from exc
        with Image.open(file_path) as image:
            return pytesseract.image_to_string(image)
    with open(file_path, "r", encoding="utf-8", errors="ignore") as handle:
        return handle.read()


def ingest_document(filename: str, file_path: str) -> dict:
    index = _load_index()
    doc_id = uuid.uuid4().hex
    text = _extract_text(file_path, filename)
    chunks = _chunk_text(text)
    chunk_entries = []
    for chunk in chunks:
        chunk_entries.append({"id": uuid.uuid4().hex, "doc_id": doc_id, "text": chunk})

    index["documents"].append({"id": doc_id, "filename": filename, "chunks": len(chunk_entries)})
    index["chunks"].extend(chunk_entries)
    _save_index(index)
    return {"id": doc_id, "filename": filename, "chunks": len(chunk_entries)}


def list_documents() -> List[dict]:
    index = _load_index()
    return index.get("documents", [])


def delete_document(doc_id: str) -> None:
    index = _load_index()
    index["documents"] = [doc for doc in index.get("documents", []) if doc["id"] != doc_id]
    index["chunks"] = [chunk for chunk in index.get("chunks", []) if chunk["doc_id"] != doc_id]
    _save_index(index)


_STOP_WORDS = {
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "you",
    "your",
    "are",
    "from",
    "have",
    "has",
    "how",
    "what",
    "when",
    "where",
    "who",
    "why",
    "can",
    "could",
    "would",
    "should",
    "into",
    "about",
    "also",
    "not",
    "but",
    "all",
    "any",
    "our",
    "their",
}


def _tokenize(text: str) -> List[str]:
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    return [token for token in tokens if len(token) > 2 and token not in _STOP_WORDS]


def _score_chunk(query_tokens: List[str], text: str, idf: Dict[str, float]) -> float:
    if not query_tokens:
        return 0.0
    text_tokens = _tokenize(text)
    if not text_tokens:
        return 0.0
    tf = Counter(text_tokens)
    score = 0.0
    for token in query_tokens:
        if token in tf:
            score += tf[token] * idf.get(token, 1.0)
    phrase = " ".join(query_tokens)
    if phrase and phrase in text.lower():
        score += 2.0
    return score


def retrieve_context(query: str) -> str:
    index = _load_index()
    chunks = index.get("chunks", [])
    if not chunks:
        return ""
    query_tokens = _tokenize(query)
    if not query_tokens:
        return ""
    total_chunks = len(chunks)
    doc_freq: Dict[str, int] = {token: 0 for token in query_tokens}
    for chunk in chunks:
        chunk_tokens = set(_tokenize(chunk.get("text", "")))
        for token in query_tokens:
            if token in chunk_tokens:
                doc_freq[token] += 1
    idf = {token: math.log((total_chunks + 1) / (doc_freq[token] + 1)) + 1 for token in query_tokens}
    scored = sorted(
        chunks,
        key=lambda chunk: _score_chunk(query_tokens, chunk.get("text", ""), idf),
        reverse=True,
    )
    top = [
        chunk
        for chunk in scored
        if _score_chunk(query_tokens, chunk.get("text", ""), idf) > 0
    ][: settings.rag_top_k]
    if not top:
        return ""
    return "\n\n".join(chunk["text"] for chunk in top)
