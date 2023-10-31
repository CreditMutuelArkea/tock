from fastapi import Depends, FastAPI

from .routers import llm, chat
from .dependencies import get_token_header

app = FastAPI(dependencies=[Depends(get_token_header)])

app.include_router(llm.router)
app.include_router(chat.router)

# TODO MASS :
# load_dotenv()
# from dotenv import load_dotenv
# from pathlib import Path
# dotenv_path = Path('path/to/.env')
# load_dotenv(dotenv_path=dotenv_path)

