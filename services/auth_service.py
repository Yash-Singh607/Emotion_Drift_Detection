from __future__ import annotations

import secrets
from datetime import datetime, timedelta
from typing import Optional, Sequence

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, create_engine, select, text
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
VALID_ROLES = {"admin", "agent", "viewer"}
TOKEN_PURPOSE_VERIFY_EMAIL = "verify_email"
TOKEN_PURPOSE_RESET_PASSWORD = "reset_password"


def _bcrypt_safe_secret(value: str) -> str:
    # bcrypt accepts at most 72 bytes; keep hashes deterministic across paths.
    return value.encode("utf-8")[:72].decode("utf-8", errors="ignore")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(20), nullable=False, default="viewer")
    is_verified = Column(Boolean, nullable=False, default=False)
    auth_provider = Column(String(20), nullable=False, default="local")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tokens = relationship("AuthToken", back_populates="user", cascade="all, delete-orphan")


class AuthToken(Base):
    __tablename__ = "auth_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(255), nullable=False, unique=True, index=True)
    purpose = Column(String(50), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="tokens")


class AuthService:
    def __init__(
        self,
        db_url: str,
        secret_key: str,
        algorithm: str = "HS256",
        access_token_expire_minutes: int = 60 * 24,
    ) -> None:
        self._engine = create_engine(db_url, future=True)
        self._session_local = sessionmaker(bind=self._engine, autoflush=False, autocommit=False, future=True)
        self._secret_key = secret_key
        self._algorithm = algorithm
        self._access_token_expire_minutes = access_token_expire_minutes

    def init_db(self) -> None:
        Base.metadata.create_all(bind=self._engine)
        self._ensure_legacy_columns()

    def _ensure_legacy_columns(self) -> None:
        with self._engine.begin() as conn:
            columns = {row[1] for row in conn.execute(text("PRAGMA table_info(users)"))}
            if "role" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'viewer' NOT NULL"))
            if "is_verified" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0 NOT NULL"))
            if "auth_provider" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'local' NOT NULL"))
            if "hashed_password" in columns:
                pass

    def get_user_by_email(self, email: str) -> Optional[User]:
        with self._session_local() as db:
            result = db.execute(select(User).where(User.email == email.lower().strip()))
            return result.scalar_one_or_none()

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        with self._session_local() as db:
            return db.get(User, user_id)

    def list_users(self) -> Sequence[User]:
        with self._session_local() as db:
            return list(db.execute(select(User).order_by(User.created_at.desc())).scalars().all())

    def create_user(
        self,
        email: str,
        password: Optional[str],
        role: str = "viewer",
        is_verified: bool = False,
        auth_provider: str = "local",
    ) -> User:
        normalized_email = email.lower().strip()
        if role not in VALID_ROLES:
            raise ValueError("invalid_role")
        with self._session_local() as db:
            existing = db.execute(select(User).where(User.email == normalized_email)).scalar_one_or_none()
            if existing:
                raise ValueError("email_already_exists")

            user = User(
                email=normalized_email,
                hashed_password=pwd_context.hash(_bcrypt_safe_secret(password)) if password else None,
                role=role,
                is_verified=is_verified,
                auth_provider=auth_provider,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return user

    def upsert_oauth_user(self, email: str, provider: str, role: str = "viewer") -> User:
        normalized_email = email.lower().strip()
        if role not in VALID_ROLES:
            raise ValueError("invalid_role")
        with self._session_local() as db:
            user = db.execute(select(User).where(User.email == normalized_email)).scalar_one_or_none()
            if user:
                user.is_verified = True
                if not user.auth_provider:
                    user.auth_provider = provider
                db.commit()
                db.refresh(user)
                return user

            user = User(
                email=normalized_email,
                # Keep a non-null placeholder for legacy schemas where
                # users.hashed_password is NOT NULL. OAuth users never
                # authenticate via password when auth_provider != "local".
                hashed_password="oauth_account_placeholder",
                role=role,
                is_verified=True,
                auth_provider=provider,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return user

    def authenticate_user(self, email: str, password: str) -> tuple[Optional[User], str]:
        user = self.get_user_by_email(email)
        if not user:
            return None, "invalid_credentials"
        if user.auth_provider != "local":
            return None, "oauth_only_account"
        if not user.hashed_password or not pwd_context.verify(password, user.hashed_password):
            return None, "invalid_credentials"
        if not user.is_verified:
            return None, "email_not_verified"
        return user, "ok"

    def create_access_token(self, user: User) -> str:
        expire = datetime.utcnow() + timedelta(minutes=self._access_token_expire_minutes)
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
            "exp": expire,
        }
        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def decode_access_token(self, token: str) -> dict:
        try:
            return jwt.decode(token, self._secret_key, algorithms=[self._algorithm])
        except JWTError as exc:
            raise ValueError("invalid_token") from exc

    def update_user_role(self, user_id: int, role: str) -> User:
        if role not in VALID_ROLES:
            raise ValueError("invalid_role")
        with self._session_local() as db:
            user = db.get(User, user_id)
            if not user:
                raise ValueError("user_not_found")
            user.role = role
            db.commit()
            db.refresh(user)
            return user

    def issue_token(self, user_id: int, purpose: str, expires_in_minutes: int) -> str:
        raw_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
        with self._session_local() as db:
            db.execute(
                text(
                    "UPDATE auth_tokens SET used_at = :used_at WHERE user_id = :user_id AND purpose = :purpose AND used_at IS NULL"
                ),
                {"used_at": datetime.utcnow(), "user_id": user_id, "purpose": purpose},
            )
            db.add(
                AuthToken(
                    user_id=user_id,
                    token=raw_token,
                    purpose=purpose,
                    expires_at=expires_at,
                )
            )
            db.commit()
        return raw_token

    def _consume_token(self, token: str, purpose: str) -> User:
        with self._session_local() as db:
            token_row = db.execute(
                select(AuthToken).where(
                    AuthToken.token == token,
                    AuthToken.purpose == purpose,
                )
            ).scalar_one_or_none()
            if not token_row:
                raise ValueError("invalid_token")
            if token_row.used_at is not None:
                raise ValueError("token_already_used")
            if token_row.expires_at < datetime.utcnow():
                raise ValueError("token_expired")
            token_row.used_at = datetime.utcnow()
            user = db.get(User, token_row.user_id)
            if not user:
                raise ValueError("user_not_found")
            db.commit()
            db.refresh(user)
            return user

    def request_email_verification(self, email: str) -> Optional[str]:
        user = self.get_user_by_email(email)
        if not user or user.is_verified:
            return None
        return self.issue_token(user.id, TOKEN_PURPOSE_VERIFY_EMAIL, expires_in_minutes=60)

    def verify_email(self, token: str) -> User:
        with self._session_local() as db:
            token_row = db.execute(
                select(AuthToken).where(
                    AuthToken.token == token,
                    AuthToken.purpose == TOKEN_PURPOSE_VERIFY_EMAIL,
                )
            ).scalar_one_or_none()
            if not token_row:
                raise ValueError("invalid_token")
            if token_row.used_at is not None:
                raise ValueError("token_already_used")
            if token_row.expires_at < datetime.utcnow():
                raise ValueError("token_expired")

            user = db.get(User, token_row.user_id)
            if not user:
                raise ValueError("user_not_found")
            user.is_verified = True
            token_row.used_at = datetime.utcnow()
            db.commit()
            db.refresh(user)
            return user

    def request_password_reset(self, email: str) -> Optional[str]:
        user = self.get_user_by_email(email)
        if not user or user.auth_provider != "local":
            return None
        return self.issue_token(user.id, TOKEN_PURPOSE_RESET_PASSWORD, expires_in_minutes=30)

    def reset_password(self, token: str, new_password: str) -> User:
        with self._session_local() as db:
            token_row = db.execute(
                select(AuthToken).where(
                    AuthToken.token == token,
                    AuthToken.purpose == TOKEN_PURPOSE_RESET_PASSWORD,
                )
            ).scalar_one_or_none()
            if not token_row:
                raise ValueError("invalid_token")
            if token_row.used_at is not None:
                raise ValueError("token_already_used")
            if token_row.expires_at < datetime.utcnow():
                raise ValueError("token_expired")

            user = db.get(User, token_row.user_id)
            if not user:
                raise ValueError("user_not_found")

            user.hashed_password = pwd_context.hash(_bcrypt_safe_secret(new_password))
            user.auth_provider = "local"
            token_row.used_at = datetime.utcnow()
            db.commit()
            db.refresh(user)
            return user

