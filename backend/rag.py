"""Retrieval and QA utilities."""

import logging
import os
from typing import List

import psycopg2
from dotenv import load_dotenv
from langchain.embeddings import GoogleGenerativeAIEmbeddings
from langchain.llms import GoogleGenerativeAI
from pgvector.psycopg import register_vector

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s")


def _get_connection() -> psycopg2.extensions.connection:
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set")
    conn = psycopg2.connect(DATABASE_URL)
    register_vector(conn)
    return conn


def retrieve(question: str, top_k: int = 5) -> List[str]:
    """Retrieve top-k relevant text chunks from the database."""
    embeddings = GoogleGenerativeAIEmbeddings(google_api_key=GEMINI_API_KEY)
    query_vec = embeddings.embed_query(question)

    conn = _get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT chunk_text FROM documents
                    ORDER BY chunk_embedding <-> %s
                    LIMIT %s
                    """,
                    (query_vec, top_k),
                )
                rows = cur.fetchall()
                return [row[0] for row in rows]
    finally:
        conn.close()


def answer_question(question: str) -> str:
    """Answer a question using retrieved context."""
    chunks = retrieve(question)
    context = "\n".join(chunks)
    llm = GoogleGenerativeAI(google_api_key=GEMINI_API_KEY)
    prompt = (
        "You are a contract-savvy assistant. Use ONLY the following excerpts to answer:\n"
        f"{context}\n\nQuestion: {question}"
    )
    logging.info("Generating answer...")
    return llm(prompt)
