from fastapi import Depends, FastAPI

from .routers import llm, chat, healthcheck
from .dependencies import get_token_header

global_dependencies = [Depends(get_token_header)]

app = FastAPI()

app.include_router(llm.router, dependencies=global_dependencies)
app.include_router(chat.router, dependencies=global_dependencies)
app.include_router(healthcheck.router)

# TODO MASS :
# load_dotenv()
# from dotenv import load_dotenv
# from pathlib import Path
# dotenv_path = Path('path/to/.env')
# load_dotenv(dotenv_path=dotenv_path)

