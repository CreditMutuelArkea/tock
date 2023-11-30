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

from llm_orchestrator.dependencies import get_token_header
from llm_orchestrator.routers.em_providers_router import em_providers_router
from llm_orchestrator.routers.health_check_router import health_check_router
from llm_orchestrator.routers.llm_providers_router import llm_providers_router
from llm_orchestrator.routers.rag_router import rag_router

global_dependencies = [Depends(get_token_header)]

app = FastAPI()

app.include_router(llm_providers_router, dependencies=global_dependencies)
app.include_router(em_providers_router, dependencies=global_dependencies)
app.include_router(rag_router, dependencies=global_dependencies)
app.include_router(health_check_router)

# TODO MASS :
# load_dotenv()
# from dotenv import load_dotenv
# from pathlib import Path
# dotenv_path = Path('path/to/.env')
# load_dotenv(dotenv_path=dotenv_path)
