import logging

from cachetools import TTLCache
from sqlalchemy import create_engine, Engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine

from gen_ai_orchestrator.models.vector_stores.pgvector.pgvector_setting import PGVectorStoreSetting
from gen_ai_orchestrator.services.security.security_service import fetch_secret_key_value
from gen_ai_orchestrator.utils.strings import obfuscate

logger = logging.getLogger(__name__)

_POOL_TTL_SECONDS = 3600

class DatabasePool:
    def __init__(self, connection_string: str):
        common_kwargs = dict(
            pool_size=10,
            max_overflow=5,
            pool_timeout=30,
            pool_recycle=_POOL_TTL_SECONDS,
            pool_pre_ping=True,
        )
        self.sync_engine: Engine = create_engine(connection_string, **common_kwargs)
        self.async_engine: AsyncEngine = create_async_engine(connection_string, **common_kwargs)


class DatabasePoolRegistry:
    def __init__(self, ttl: int = _POOL_TTL_SECONDS):
        self._cache: TTLCache = TTLCache(maxsize=128, ttl=ttl)

    @staticmethod
    def _conn_string(setting: PGVectorStoreSetting) -> str:
        password = fetch_secret_key_value(setting.password)
        logger.info(
            'PostgreSQL user credentials: %s:%s',
            setting.username,
            obfuscate(password),
        )

        return (
            f"postgresql+psycopg://{setting.username}:{password}"
            f"@{setting.host}:{setting.port}/{setting.database}"
        )

    def get_or_create(self, setting: PGVectorStoreSetting) -> DatabasePool:
        if setting not in self._cache:
            logger.info(f"New pool [{setting.provider.name}] {setting.host}/{setting.database}")
            self._cache[setting] = DatabasePool(self._conn_string(setting))
        else:
            logger.debug(f"Pool [{setting.provider.name}] reused")

        return self._cache[setting]


db_pool_registry = DatabasePoolRegistry()