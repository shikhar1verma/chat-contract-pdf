"""PDF ingestion module for contract search."""

import logging
import os
from typing import List

import psycopg2
from dotenv import load_dotenv
from langchain.document_loaders import PyPDFLoader
from langchain.embeddings import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pgvector.psycopg import register_vector

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s")


def _get_connection() -> psycopg2.extensions.connection:
    """Create and return a new PostgreSQL connection."""
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set in environment variables")
    conn = psycopg2.connect(DATABASE_URL)
    register_vector(conn)
    return conn


def ingest_file(file_path: str, filename: str) -> None:
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

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(documents)
    logging.info("Split into %d chunks", len(chunks))

    try:
        embeddings = GoogleGenerativeAIEmbeddings(google_api_key=GEMINI_API_KEY)
    except Exception as exc:
        logging.error("Failed to initialize embeddings: %s", exc)
        raise

    texts: List[str] = [doc.page_content for doc in chunks]
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
                for idx, (text, vector) in enumerate(zip(texts, vectors), start=1):
                    cur.execute(
                        """
                        INSERT INTO documents (filename, chunk_text, chunk_embedding)
                        VALUES (%s, %s, %s)
                        """,
                        (filename, text, vector),
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
