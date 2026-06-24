import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from enum import Enum
from typing import List, Optional

import httpx
import uvicorn
from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from authlib.integrations.starlette_client import OAuth, OAuthError

from services.analysis_service import AnalysisService
from services.auth_service import AuthService
from services.session_store import SessionStore

DEFAULT_SESSION_ID = "default"
logger = logging.getLogger("emotion_drift_api")
if not logger.handlers:
    logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
load_dotenv()

AUTH_SECRET_KEY = os.environ.get("AUTH_SECRET_KEY", "change-this-in-production")
AUTH_ALGORITHM = os.environ.get("AUTH_ALGORITHM", "HS256")
AUTH_EXPIRE_MINUTES = int(os.environ.get("AUTH_EXPIRE_MINUTES", "1440"))
AUTH_DB_URL = os.environ.get("AUTH_DB_URL", "sqlite:///./auth.db")
APP_ENV = os.environ.get("APP_ENV", "development").lower()
IS_PRODUCTION = APP_ENV == "production"
AUTH_EXPOSE_TOKENS = os.environ.get("AUTH_EXPOSE_TOKENS", "false").lower() == "true"
SESSION_SECRET = os.environ.get("SESSION_SECRET", AUTH_SECRET_KEY)
FRONTEND_APP_URL = os.environ.get("FRONTEND_APP_URL", "http://localhost:3000")
FRONTEND_OAUTH_REDIRECT_PATH = os.environ.get("FRONTEND_OAUTH_REDIRECT_PATH", "/")
_trusted_hosts_env = [h.strip() for h in os.environ.get("TRUSTED_HOSTS", "").split(",") if h.strip()]
if not IS_PRODUCTION and "testserver" not in _trusted_hosts_env:
    _trusted_hosts_env.append("testserver")
TRUSTED_HOSTS = _trusted_hosts_env
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth = OAuth()


async def _google_exchange_code_for_token(request: Request) -> dict:
    code = request.query_params.get("code")
    if not code:
        raise ValueError("missing_authorization_code")

    redirect_uri = str(request.url_for("auth_oauth_callback", provider="google"))
    payload = {
        "code": code,
        "client_id": google_client_id,
        "client_secret": google_client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post("https://oauth2.googleapis.com/token", data=payload)
        response.raise_for_status()
        return response.json()


@asynccontextmanager
async def lifespan(application: FastAPI):
    if IS_PRODUCTION:
        if AUTH_SECRET_KEY == "change-this-in-production" or len(AUTH_SECRET_KEY) < 32:
            raise RuntimeError("AUTH_SECRET_KEY must be set to a strong value in production.")
        if SESSION_SECRET == "change-this-session-signing-secret" or len(SESSION_SECRET) < 32:
            raise RuntimeError("SESSION_SECRET must be set to a strong value in production.")
        if AUTH_EXPOSE_TOKENS:
            raise RuntimeError("AUTH_EXPOSE_TOKENS must be false in production.")

    application.state.session_store = SessionStore()
    application.state.analysis_service = AnalysisService()
    application.state.auth_service = AuthService(
        db_url=AUTH_DB_URL,
        secret_key=AUTH_SECRET_KEY,
        algorithm=AUTH_ALGORITHM,
        access_token_expire_minutes=AUTH_EXPIRE_MINUTES,
    )
    application.state.auth_service.init_db()
    logger.info("emotion_drift_api_startup")
    yield
    logger.info("emotion_drift_api_shutdown")


app = FastAPI(title="Real-Time Emotion Drift Detection", lifespan=lifespan)
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET)
if TRUSTED_HOSTS:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=TRUSTED_HOSTS)


def _allowed_origins() -> List[str]:
    allowed_origins_env = os.environ.get("CORS_ALLOWED_ORIGINS", "")
    if allowed_origins_env:
        return [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    return [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

google_client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
google_client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "")
if google_client_id and google_client_secret:
    oauth.register(
        name="google",
        client_id=google_client_id,
        client_secret=google_client_secret,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

github_client_id = os.environ.get("GITHUB_CLIENT_ID", "")
github_client_secret = os.environ.get("GITHUB_CLIENT_SECRET", "")
if github_client_id and github_client_secret:
    oauth.register(
        name="github",
        client_id=github_client_id,
        client_secret=github_client_secret,
        access_token_url="https://github.com/login/oauth/access_token",
        authorize_url="https://github.com/login/oauth/authorize",
        api_base_url="https://api.github.com/",
        client_kwargs={"scope": "user:email"},
    )


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    start_time = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

    response.headers["x-request-id"] = request_id
    response.headers["x-process-time-ms"] = str(elapsed_ms)
    response.headers["x-content-type-options"] = "nosniff"
    response.headers["x-frame-options"] = "DENY"
    response.headers["referrer-policy"] = "strict-origin-when-cross-origin"
    response.headers["permissions-policy"] = "camera=(), microphone=(), geolocation=()"
    if request.url.scheme == "https":
        response.headers["strict-transport-security"] = "max-age=63072000; includeSubDomains; preload"
    logger.info(
        "request_complete method=%s path=%s status=%s request_id=%s duration_ms=%s",
        request.method,
        request.url.path,
        response.status_code,
        request_id,
        elapsed_ms,
    )
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": "validation_error", "details": exc.errors()},
    )


@app.exception_handler(ValueError)
async def value_error_handler(_: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"error": "bad_request", "details": str(exc) if not IS_PRODUCTION else "Request could not be processed"},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("unhandled_exception path=%s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "details": f"{type(exc).__name__}: {exc}" if AUTH_EXPOSE_TOKENS else "Unexpected server error",
        },
    )


class PredictEmotionRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = Field(default=None, max_length=128)


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = Field(default=None, max_length=128)


class PredictEmotionResponse(BaseModel):
    emotion: str
    confidence: float
    drift_score: float
    risk_level: str
    escalation_required: bool
    session_id: str


class PredictResponse(BaseModel):
    message: str
    top_emotions: List[List[object]]
    weighted_score: float
    drift_score: float
    escalation_status: str
    session_id: str


class TimelineResponse(BaseModel):
    session_id: str
    timeline: List[dict]


class ResetResponse(BaseModel):
    session_id: str
    status: str


class AuthRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: Optional[str] = Field(default="viewer")


class AuthLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_verified: bool


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    verification_token: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=255)
    new_password: str = Field(..., min_length=8, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=255)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class RoleUpdateRequest(BaseModel):
    role: str


class GenericMessageResponse(BaseModel):
    message: str
    debug_token: Optional[str] = None


class OAuthProvider(str, Enum):
    google = "google"
    github = "github"


def _normalize_session_id(session_id: Optional[str]) -> str:
    if session_id is None:
        return DEFAULT_SESSION_ID
    candidate = session_id.strip()
    return candidate or DEFAULT_SESSION_ID


def _resolve_session_id(session_id: Optional[str], user: UserResponse) -> str:
    if session_id and session_id.strip():
        return _normalize_session_id(session_id)
    return f"user-{user.id}"


def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    auth_service = app.state.auth_service
    try:
        payload = auth_service.decode_access_token(token)
        user_id = int(payload.get("sub"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        ) from exc

    user = auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return UserResponse(id=user.id, email=user.email, role=user.role, is_verified=user.is_verified)


def require_roles(*roles: str):
    def _dependency(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this action",
            )
        return current_user

    return _dependency


def require_verified_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email to use protected features",
        )
    return current_user


@app.post("/auth/register", response_model=AuthResponse)
def auth_register(payload: AuthRegisterRequest):
    auth_service = app.state.auth_service
    role = (payload.role or "viewer").lower().strip()
    if role not in {"admin", "agent", "viewer"}:
        raise HTTPException(status_code=422, detail="Invalid role value")
    try:
        user = auth_service.create_user(payload.email, payload.password, role=role, is_verified=False, auth_provider="local")
    except ValueError as exc:
        if str(exc) == "email_already_exists":
            raise HTTPException(status_code=409, detail="Email is already registered") from exc
        raise

    verification_token = auth_service.request_email_verification(user.email)
    token = auth_service.create_access_token(user)
    return AuthResponse(
        access_token=token,
        user=UserResponse(id=user.id, email=user.email, role=user.role, is_verified=user.is_verified),
        verification_token=verification_token if AUTH_EXPOSE_TOKENS else None,
    )


@app.post("/auth/login", response_model=AuthResponse)
def auth_login(payload: AuthLoginRequest):
    auth_service = app.state.auth_service
    user, reason = auth_service.authenticate_user(payload.email, payload.password)
    if not user:
        reason_to_status = {
            "invalid_credentials": (401, "Invalid email or password"),
            "email_not_verified": (403, "Please verify your email before signing in"),
            "oauth_only_account": (403, "This account uses OAuth. Please continue with Google/GitHub"),
        }
        status_code, detail = reason_to_status.get(reason, (401, "Invalid credentials"))
        raise HTTPException(status_code=status_code, detail=detail)

    token = auth_service.create_access_token(user)
    return AuthResponse(
        access_token=token,
        user=UserResponse(id=user.id, email=user.email, role=user.role, is_verified=user.is_verified),
    )


@app.get("/auth/me", response_model=UserResponse)
def auth_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@app.post("/auth/forgot-password", response_model=GenericMessageResponse)
def auth_forgot_password(payload: ForgotPasswordRequest):
    auth_service = app.state.auth_service
    reset_token = auth_service.request_password_reset(payload.email)
    return GenericMessageResponse(
        message="If that email exists, a reset link has been issued.",
        debug_token=reset_token if AUTH_EXPOSE_TOKENS else None,
    )


@app.post("/auth/reset-password", response_model=GenericMessageResponse)
def auth_reset_password(payload: ResetPasswordRequest):
    auth_service = app.state.auth_service
    try:
        auth_service.reset_password(payload.token, payload.new_password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return GenericMessageResponse(message="Password has been reset successfully.")


@app.post("/auth/resend-verification", response_model=GenericMessageResponse)
def auth_resend_verification(payload: ResendVerificationRequest):
    auth_service = app.state.auth_service
    token = auth_service.request_email_verification(payload.email)
    return GenericMessageResponse(
        message="If your account exists and is unverified, a new verification email has been issued.",
        debug_token=token if AUTH_EXPOSE_TOKENS else None,
    )


@app.post("/auth/verify-email", response_model=GenericMessageResponse)
def auth_verify_email(payload: VerifyEmailRequest):
    auth_service = app.state.auth_service
    try:
        auth_service.verify_email(payload.token)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return GenericMessageResponse(message="Email verified successfully.")


@app.get("/auth/oauth/{provider}/start")
async def auth_oauth_start(request: Request, provider: OAuthProvider):
    client = oauth.create_client(provider.value)
    if client is None:
        raise HTTPException(status_code=503, detail=f"{provider.value} OAuth is not configured on server")
    redirect_uri = request.url_for("auth_oauth_callback", provider=provider.value)
    return await client.authorize_redirect(request, redirect_uri)


@app.get("/auth/oauth/{provider}/callback")
async def auth_oauth_callback(request: Request, provider: OAuthProvider):
    client = oauth.create_client(provider.value)
    if client is None:
        raise HTTPException(status_code=503, detail=f"{provider.value} OAuth is not configured on server")

    try:
        try:
            token = await client.authorize_access_token(request)
        except ValueError:
            if provider.value == "google":
                token = await _google_exchange_code_for_token(request)
            else:
                raise
    except OAuthError as exc:
        raise HTTPException(status_code=400, detail=f"OAuth failed: {exc.error}") from exc

    try:
        email: Optional[str] = None
        if provider.value == "google":
            user_info = token.get("userinfo")
            if not user_info:
                if token.get("access_token"):
                    async with httpx.AsyncClient(timeout=15.0) as http_client:
                        profile_response = await http_client.get(
                            "https://openidconnect.googleapis.com/v1/userinfo",
                            headers={"Authorization": f"Bearer {token['access_token']}"},
                        )
                        profile_response.raise_for_status()
                        user_info = profile_response.json()
                else:
                    user_info = await client.userinfo(token=token)
            email = user_info.get("email")
        elif provider.value == "github":
            user_resp = await client.get("user", token=token)
            user_json = user_resp.json()
            email = user_json.get("email")
            if not email:
                emails_resp = await client.get("user/emails", token=token)
                emails = emails_resp.json()
                if isinstance(emails, list) and emails:
                    primary = next((e for e in emails if e.get("primary")), emails[0])
                    email = primary.get("email")
            if not email and user_json.get("login"):
                email = f"{user_json['login']}@users.noreply.github.com"

        if not email:
            raise HTTPException(status_code=400, detail="OAuth provider did not return an email")

        auth_service = app.state.auth_service
        user = auth_service.upsert_oauth_user(email=email, provider=provider.value)
        app_token = auth_service.create_access_token(user)

        redirect_target = (
            f"{FRONTEND_APP_URL.rstrip('/')}{FRONTEND_OAUTH_REDIRECT_PATH}"
            f"?token={app_token}&provider={provider.value}"
        )
        return RedirectResponse(url=redirect_target, status_code=302)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("oauth_callback_failure provider=%s", provider.value)
        detail = (
            f"OAuth callback failed: {type(exc).__name__}: {exc}"
            if AUTH_EXPOSE_TOKENS
            else "OAuth callback failed"
        )
        raise HTTPException(status_code=500, detail=detail) from exc


@app.get("/auth/users", response_model=List[UserResponse])
def auth_list_users(_: UserResponse = Depends(require_roles("admin"))):
    users = app.state.auth_service.list_users()
    return [
        UserResponse(id=user.id, email=user.email, role=user.role, is_verified=user.is_verified)
        for user in users
    ]


@app.patch("/auth/users/{user_id}/role", response_model=UserResponse)
def auth_update_user_role(
    user_id: int,
    payload: RoleUpdateRequest,
    _: UserResponse = Depends(require_roles("admin")),
):
    try:
        updated_user = app.state.auth_service.update_user_role(user_id=user_id, role=payload.role.lower().strip())
    except ValueError as exc:
        if str(exc) == "user_not_found":
            raise HTTPException(status_code=404, detail="User not found") from exc
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return UserResponse(
        id=updated_user.id,
        email=updated_user.email,
        role=updated_user.role,
        is_verified=updated_user.is_verified,
    )


@app.post("/predict-emotion", response_model=PredictEmotionResponse)
def predict_emotion(
    request: PredictEmotionRequest,
    current_user: UserResponse = Depends(require_verified_user),
):
    session_id = _resolve_session_id(request.session_id, current_user)
    session_store = app.state.session_store
    analysis_service = app.state.analysis_service

    existing_timeline = session_store.get_timeline(session_id)
    result = analysis_service.analyze_message(request.message, existing_timeline)
    session_store.append(
        session_id,
        {"message": request.message, "emotions": result.emotions, "score": result.weighted_score},
    )

    top_emotion = result.top_emotion
    return PredictEmotionResponse(
        emotion=str(top_emotion.get("label", "neutral")),
        confidence=round(float(top_emotion.get("score", 0.0)), 4),
        drift_score=round(result.drift_score, 3),
        risk_level=result.risk_level,
        escalation_required=result.escalation_required,
        session_id=session_id,
    )


@app.post("/predict", response_model=PredictResponse)
def predict(
    request: PredictRequest,
    current_user: UserResponse = Depends(require_verified_user),
):
    session_id = _resolve_session_id(request.session_id, current_user)
    session_store = app.state.session_store
    analysis_service = app.state.analysis_service

    existing_timeline = session_store.get_timeline(session_id)
    result = analysis_service.analyze_message(request.text, existing_timeline)
    session_store.append(
        session_id,
        {"message": request.text, "emotions": result.emotions, "score": result.weighted_score},
    )

    top_emotions = [[e["label"], round(float(e["score"]), 2)] for e in result.emotions]
    return PredictResponse(
        message=request.text,
        top_emotions=top_emotions,
        weighted_score=round(result.weighted_score, 3),
        drift_score=round(result.drift_score, 3),
        escalation_status=result.risk_level,
        session_id=session_id,
    )


@app.get("/timeline", response_model=TimelineResponse)
def get_timeline(
    session_id: str = Query(default="", max_length=128),
    current_user: UserResponse = Depends(require_verified_user),
):
    normalized = _resolve_session_id(session_id, current_user)
    return TimelineResponse(
        session_id=normalized,
        timeline=app.state.session_store.get_timeline(normalized),
    )


@app.post("/reset", response_model=ResetResponse)
def reset_timeline(
    session_id: str = Query(default="", max_length=128),
    current_user: UserResponse = Depends(require_roles("admin", "agent")),
):
    normalized = _resolve_session_id(session_id, current_user)
    app.state.session_store.reset(normalized)
    return ResetResponse(session_id=normalized, status="timeline reset")


@app.get("/")
def root():
    return {"status": "Emotion Drift Backend Running"}


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
