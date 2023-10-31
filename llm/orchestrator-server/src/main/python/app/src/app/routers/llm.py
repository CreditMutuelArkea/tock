from fastapi import APIRouter, Depends, HTTPException
from ..models.llm.llmprovider import LLMProvider
from ..services.llm.llmservice import checkLLMSetting
from ..dependencies import get_token_header
from ..exceptions.FunctionalException import FunctionalException

router = APIRouter(
    prefix="/llm",
    tags=["LLM"],
    dependencies=[Depends(get_token_header)],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def listLLMs():
    return [provider.value for provider in LLMProvider]


@router.get("/{providerId}")
async def getLLM(providerId: str):
    return LLMProvider.has_value(providerId)


@router.post("/check-setting")
async def checkSetting(setting: dict, isEmbeddingModel: bool = False):
    try:
        return checkLLMSetting(setting, isEmbeddingModel)
    except FunctionalException as e:
        raise HTTPException(status_code=400, detail=e.args[0])
