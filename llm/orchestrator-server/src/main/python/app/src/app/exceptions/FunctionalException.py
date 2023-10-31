from typing import Union
from .ErrorCode import ErrorCode


class FunctionalException(Exception):
    def __init__(self, code: ErrorCode, message: Union[str, None] = None):
        if message:
            super().__init__(message)
        else:
            super().__init__(code.value)

        self.code = code
