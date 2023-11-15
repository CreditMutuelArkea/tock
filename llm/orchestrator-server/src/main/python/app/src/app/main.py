#   Copyright (C) 2023 Credit Mutuel Arkea
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
from fastapi import Depends, FastAPI
from src.main.python.app.src.app.dependencies import get_token_header
from src.main.python.app.src.app.routers import chat, healthcheck, llm

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
