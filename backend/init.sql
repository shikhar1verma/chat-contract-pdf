CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE uploads (
    upload_id  UUID PRIMARY KEY,
    filename   TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
    id              SERIAL PRIMARY KEY,
    upload_id       UUID REFERENCES uploads(upload_id) ON DELETE CASCADE,
    chunk_text      TEXT,
    chunk_embedding VECTOR(768),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON documents USING hnsw (chunk_embedding vector_cosine_ops);
CREATE INDEX ON uploads (created_at);
