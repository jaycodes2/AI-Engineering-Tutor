import os
import json
import logging
from pathlib import Path
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

logger = logging.getLogger(__name__)
security = HTTPBearer()

def _init_firebase():
    if firebase_admin._apps:
        return

    # Option 1: JSON string in env var (for Railway/production)
    sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    if sa_json:
        try:
            sa_dict = json.loads(sa_json)
            cred = credentials.Certificate(sa_dict)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized from FIREBASE_SERVICE_ACCOUNT_JSON env var")
            return
        except Exception as e:
            logger.error("Failed to init Firebase from env var: %s", e)

    # Option 2: Local serviceAccount.json file (for local dev)
    sa_path = Path(__file__).parent.parent / "serviceAccount.json"
    if sa_path.exists():
        cred = credentials.Certificate(str(sa_path))
        firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized from serviceAccount.json file")
        return

    raise RuntimeError(
        "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_JSON env var "
        "or place serviceAccount.json in the backend folder."
    )

_init_firebase()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        decoded = firebase_auth.verify_id_token(token)
        return {"uid": decoded["uid"], "email": decoded.get("email", "")}
    except Exception as e:
        logger.warning("Auth failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )