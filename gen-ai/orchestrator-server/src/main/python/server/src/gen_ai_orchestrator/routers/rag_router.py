#   Copyright (C) 2023-2024 Credit Mutuel Arkea
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
"""RAG Router Module"""
import json
from typing import Annotated, Optional

from fastapi import APIRouter, Form, HTTPException, UploadFile
from pydantic import TypeAdapter

from gen_ai_orchestrator.models.llm.llm_types import LLMSetting
from gen_ai_orchestrator.routers.requests.requests import (
    RagQuery,
    RagVisionQuery,
)
from gen_ai_orchestrator.routers.responses.responses import RagResponse
from gen_ai_orchestrator.services.rag.rag_service import rag
from gen_ai_orchestrator.services.vision.vision_service import (
    ask_model_with_files,
)

rag_router = APIRouter(prefix='/rag', tags=['Retrieval Augmented Generation'])


@rag_router.post('')
async def ask_rag(query: RagQuery, debug: bool = False) -> RagResponse:
    """
    ## Ask a RAG System
    Ask question to a RAG System, and return answer by using a knowledge base (documents)
    """
    return await rag(query, debug)


@rag_router.post('/document')
async def ask_rag_with_pdf(
    query: Annotated[str, Form(json_schema_extra=RagVisionQuery.model_json_schema())],
    files: Optional[list[UploadFile]],
):
    for file in files:
        if file.content_type not in [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/pdf',
        ]:
            raise HTTPException(
                status_code=400,
                detail='Invalid file format. Please upload a JPEG/PNG images or PDF files.',
            )

    query: LLMSetting = TypeAdapter(RagVisionQuery).validate_python(json.loads(query))

    return await ask_model_with_files(query, files)
