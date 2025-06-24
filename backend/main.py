"""FastAPI application exposing ingest and chat endpoints."""

import os
import shutil
import tempfile

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ingest import ingest_file
from rag import answer_question

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    question: str


@app.post("/ingest")
async def ingest_endpoint(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    try:
        ingest_file(tmp_path, file.filename)
    finally:
        os.remove(tmp_path)
    return {"status": "success"}


@app.post("/chat")
async def chat_endpoint(question: Question):
    answer = answer_question(question.question)
    return {"answer": answer}
