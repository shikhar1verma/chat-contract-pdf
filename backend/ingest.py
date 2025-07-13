"""PDF ingestion module for contract search."""

import logging, os, uuid, re
from typing import List

import psycopg
from psycopg import Connection
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pgvector.psycopg import register_vector

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
_CONTROL_CHARS_RE = re.compile(
    r"[\x00-\x08\x0B\x0C\x0E-\x1F]"   # leave 09 (TAB), 0A (LF), 0D (CR)
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s")

def _sanitize(text: str) -> str:
    """
    Remove characters that cannot be stored in a PostgreSQL TEXT field.
    Right now we just strip the NUL byte and control characters.
    """
    return _CONTROL_CHARS_RE.sub("", text)

def _get_connection() -> Connection:
    """Create and return a new PostgreSQL connection."""
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set in environment variables")
    conn = psycopg.connect(DATABASE_URL)
    register_vector(conn)
    return conn


def ingest_file(file_path, filename, upload_id) -> None:
    """Ingest a PDF file into the PGVector-enabled PostgreSQL database.

    Args:
        file_path: Path to the PDF file on disk.
        filename: Original filename for reference in the database.
    """

    logging.info("Loading PDF: %s", file_path)
    try:
        loader = PyPDFLoader(file_path)
        documents = loader.load()
    except Exception as exc:
        logging.error("Failed to load PDF %s: %s", file_path, exc)
        raise

    splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=400)
    chunks = splitter.split_documents(documents)
    logging.info("Chunks created: %d", len(chunks))
    for i, chunk in enumerate(chunks):
        logging.debug("Chunk %d length: %d chars", i+1, len(chunk.page_content))

    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=GEMINI_API_KEY)
    except Exception as exc:
        logging.error("Failed to initialize embeddings: %s", exc)
        raise

    texts: List[str] = [_sanitize(doc.page_content) for doc in chunks]
    logging.info("Embedding text chunks...")
    try:
        vectors = embeddings.embed_documents(texts)
    except Exception as exc:
        logging.error("Embedding failed: %s", exc)
        raise

    conn = None
    try:
        conn = _get_connection()
        with conn:
            with conn.cursor() as cur:
                # write parent row once
                cur.execute(
                    "INSERT INTO uploads (upload_id, filename) VALUES (%s, %s)",
                    (upload_id, filename),
                )
                for idx, (text, vector) in enumerate(zip(texts, vectors), start=1):
                    cur.execute(
                        """
                        INSERT INTO documents (upload_id, chunk_text, chunk_embedding)
                        VALUES (%s, %s, %s)
                        """,
                        (upload_id, text, vector),
                    )
                    logging.info("Inserted chunk %d/%d", idx, len(texts))
    except Exception as exc:
        logging.error("Database insertion failed: %s", exc)
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

    logging.info("Ingestion complete for %s", filename)
