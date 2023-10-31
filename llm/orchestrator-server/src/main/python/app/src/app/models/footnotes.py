from dataclasses import dataclass
from typing import Union


@dataclass
class FootNote:
    identifier: str
    title: str
    url: Union[str, None] = None
