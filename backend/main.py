"""FastAPI app exposing ingest, status & chat endpoints."""

import os, shutil, tempfile, uuid
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from secure import Secure
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from ingest import ingest_file, create_upload, update_progress, _get_connection
from rag import answer_question

limiter = Limiter(key_func=get_remote_address)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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


class Question(BaseModel):
    question: str
    upload_id: str


@app.post("/ingest")
@limiter.limit("2/minute")
async def ingest_endpoint(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    MAX_MB = 10
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files allowed")
    if file.size > MAX_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large (> {MAX_MB} MB)")

    upload_id = str(uuid.uuid4())
    create_upload(upload_id, file.filename)
    update_progress(upload_id, "Ingestion queued")

    # save tmp
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    shutil.copyfileobj(file.file, tmp)
    tmp.close()

    # queue background task
    background_tasks.add_task(ingest_file, tmp.name, file.filename, upload_id)

    return {"upload_id": upload_id, "progress": "Ingestion queued"}


@app.get("/status/{upload_id}")
async def status(upload_id: str):
    conn = _get_connection()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                "SELECT progress FROM uploads WHERE upload_id = %s",
                (upload_id,),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(404, "upload_id not found")
            return {"progress": row[0] or ""}
    finally:
        conn.close()


@app.post("/chat")
@limiter.limit("30/minute")
async def chat_endpoint(request: Request, question: Question):
    answer = answer_question(question.question, question.upload_id)
    return {"answer": answer}


@app.delete("/reset/{upload_id}")
async def reset(upload_id: str):
    conn = _get_connection()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                "SELECT EXISTS(SELECT 1 FROM uploads WHERE upload_id = %s)",
                (upload_id,)
            )
            exists = cur.fetchone()[0]
            
            if not exists:
                raise HTTPException(
                    status_code=404,
                    detail=f"Document with upload_id {upload_id} not found"
                )

            cur.execute("DELETE FROM uploads WHERE upload_id=%s", (upload_id,))
            return {
                "status": "success",
                "message": "Document deleted successfully",
                "upload_id": upload_id
            }
    except HTTPException:
        raise  # Re-raise our 404 error
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()  # Ensure connection is always closed
