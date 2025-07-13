# Chat with Your Document

This project demonstrates a simple RAG application with vector database that lets users upload a document and chat with it using a language model.

## Local Development

Backend and database run via Docker Compose:

```bash
cd backend
docker compose up --build
```

Frontend runs with Next.js:

```bash
cd frontend
npm install
npm run dev
```

Make sure `backend/.env` contains valid values for `DATABASE_URL` and `GEMINI_API_KEY`.
