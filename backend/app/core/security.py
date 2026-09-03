from __future__ import annotations

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core import settings
from app.db import get_db
from app.models import User

_bearer_scheme = HTTPBearer(auto_error=False)


_jwks_client = PyJWKClient(settings.CLERK_JWKS_URL, cache_keys=True)


class ClerkClaims(BaseModel):
    """Verified claims decoded from a Clerk session token."""

    user_id: str
    session_id: str | None = None
    raw: dict


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def _decode_clerk_token(token: str) -> ClerkClaims:
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
    except (jwt.PyJWKClientError, jwt.InvalidTokenError) as exc:
        raise _unauthorized("Unable to verify token signature") from exc

    try:
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
            leeway=settings.CLERK_JWT_LEEWAY_SECONDS,
            options={"require": ["exp", "iat", "sub"], "verify_aud": False},
        )
    except jwt.InvalidTokenError as exc:
        raise _unauthorized("Invalid or expired session token") from exc

    authorized_parties = settings.clerk_authorized_parties
    if authorized_parties and payload.get("azp") not in authorized_parties:
        raise _unauthorized("Token was not issued for this application")

    return ClerkClaims(
        user_id=payload["sub"],
        session_id=payload.get("sid"),
        raw=payload,
    )


def get_clerk_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> ClerkClaims:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized("Missing bearer token")
    return _decode_clerk_token(credentials.credentials)


def get_current_user(
    claims: ClerkClaims = Depends(get_clerk_claims),
    db: Session = Depends(get_db),
) -> User:
    user = db.query(User).filter(User.auth_provider_id == claims.user_id).one_or_none()
    if user is None:
        raise _unauthorized("No local account linked to this Clerk user")
    return user


def get_optional_clerk_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> ClerkClaims | None:
   
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None
    return _decode_clerk_token(credentials.credentials)


def get_current_user_optional(
    claims: ClerkClaims | None = Depends(get_optional_clerk_claims),
    db: Session = Depends(get_db),
) -> User | None:
    if claims is None:
        return None
    user = db.query(User).filter(User.auth_provider_id == claims.user_id).one_or_none()
    if user is None:
        raise _unauthorized("No local account linked to this Clerk user")
    return user
