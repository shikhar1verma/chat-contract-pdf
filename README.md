# Chat with Your Contract PDF

This project demonstrates a simple RAG application that lets users upload a contract PDF and chat with it using a language model.

## Local Development

Backend and database run via Docker Compose:

```bash
cd backend
docker-compose up --build
```

Frontend runs with Next.js:

```bash
cd frontend
npm install
npm run dev
```

Make sure `backend/.env` contains valid values for `DATABASE_URL` and `GEMINI_API_KEY`.
