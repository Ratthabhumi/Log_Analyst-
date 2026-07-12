import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

SECRET_KEY = os.getenv("JWT_SECRET", "eventiq-dev-secret-change-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

# Defined Users
USERS = {
    "admin": {"password": "P@ssw0rd", "role": "admin"},
    "TAR": {"password": "T@ssw0rd", "role": "user"},
    "Mew": {"password": "M@ssw0rd", "role": "user"},
}

# In production, use os.getenv overrides for admin if needed
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "P@ssw0rd")
USERS["admin"]["password"] = ADMIN_PASSWORD

security = HTTPBearer()


def create_access_token(username: str, role: str = "user") -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"sub": username, "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_credentials(username: str, password: str) -> str | None:
    for exact_username, user_info in USERS.items():
        if exact_username.lower() == username.lower():
            if user_info["password"] == password:
                return exact_username
            break
    return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return username
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
