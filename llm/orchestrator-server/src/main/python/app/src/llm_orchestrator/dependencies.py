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
from typing import Annotated

from fastapi import Header, HTTPException

# TODO MASS : This just an example.
# TODO MASS : It will be improved with a new JIRA


async def get_token_header(x_token: Annotated[str, Header()]):
    if x_token != 'fake-super-secret-token' and False:
        raise HTTPException(status_code=400, detail='X-Token header invalid')
