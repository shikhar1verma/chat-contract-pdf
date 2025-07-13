"""FastAPI application exposing ingest and chat endpoints."""

import os, shutil, tempfile, uuid

from fastapi import FastAPI, File, UploadFile, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from secure import Secure

from ingest import ingest_file
from rag import answer_question

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
ALLOWED_ORIGINS = os .getenv("ALLOWED_ORIGINS", "").split(",")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

secure_headers = Secure.with_default_headers()
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    await secure_headers.set_headers_async(response)
    return response

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

class Question(BaseModel):
    question: str
    upload_id: str

@app.post("/ingest")
@limiter.limit("2/minute") 
async def ingest_endpoint(request: Request, file: UploadFile = File(...)):
    MAX_MB = 10
    if file.content_type not in ("application/pdf",):
        raise HTTPException(400, "Only PDF files allowed")
    if file.size > MAX_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large (> {MAX_MB} MB)")
    upload_id = str(uuid.uuid4())   
    safe_name = os.path.basename(file.filename)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    try:
        ingest_file(tmp_path, file.filename, upload_id)
    finally:
        os.remove(tmp_path)
    return {"status": "success", "upload_id": upload_id}

@app.post("/chat")
async def chat_endpoint(question: Question):
    answer = answer_question(question.question, question.upload_id)
    return {"answer": answer}

@app.delete("/reset/{upload_id}")
@limiter.limit("30/minute") 
def reset(request: Request, upload_id: str):
    from ingest import _get_connection
    conn = _get_connection()
    try:
        with conn, conn.cursor() as cur:
            # Delete from uploads table
            cur.execute("DELETE FROM uploads WHERE upload_id=%s", (upload_id,))
            # Delete from vectors table if you have one
            cur.execute("DELETE FROM vectors WHERE upload_id=%s", (upload_id,))
        return {"status": "success", "message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
