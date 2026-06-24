"""
J.M.A. Motor Service - FastAPI Backend
Handles service request submissions (MongoDB persistence + optional email notification).
"""
from __future__ import annotations

import os
import uuid
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, List
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, field_validator

# ---------------------------------------------------------------------------
# Environment & logging
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("jma")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev").strip()
BUSINESS_EMAIL = os.environ.get("BUSINESS_EMAIL", "info@jmamotorservice.ie").strip()

# ---------------------------------------------------------------------------
# Mongo connection
# ---------------------------------------------------------------------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ---------------------------------------------------------------------------
# FastAPI app + router (everything under /api)
# ---------------------------------------------------------------------------
app = FastAPI(title="J.M.A. Motor Service API", version="1.0.0")
api = APIRouter(prefix="/api")


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class ServiceRequestIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., min_length=5, max_length=40)
    email: Optional[EmailStr] = None
    car_make_model: str = Field(..., min_length=2, max_length=120)
    service_needed: str = Field(..., min_length=2, max_length=120)
    preferred_date: Optional[str] = Field(default=None, max_length=40)
    message: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("name", "phone", "car_make_model", "service_needed")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()


class ServiceRequestOut(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[EmailStr] = None
    car_make_model: str
    service_needed: str
    preferred_date: Optional[str] = None
    message: Optional[str] = None
    email_sent: bool = False
    created_at: str


# ---------------------------------------------------------------------------
# Email helper (Resend) - best-effort, never raises to the caller
# ---------------------------------------------------------------------------
def _build_email_html(payload: ServiceRequestIn, request_id: str) -> str:
    rows = [
        ("Request ID", request_id),
        ("Name", payload.name),
        ("Phone", payload.phone),
        ("Email", payload.email or "—"),
        ("Car (make & model)", payload.car_make_model),
        ("Service needed", payload.service_needed),
        ("Preferred date", payload.preferred_date or "—"),
        ("Message", (payload.message or "—").replace("\n", "<br/>")),
    ]
    body_rows = "".join(
        f"""<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#a3a3a3;font-family:Arial,sans-serif;font-size:13px;width:180px;vertical-align:top;">{label}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;">{value}</td>
        </tr>"""
        for label, value in rows
    )
    return f"""
    <div style="background:#050505;padding:32px 0;font-family:Arial,sans-serif;">
      <table role="presentation" width="600" align="center" cellspacing="0" cellpadding="0" style="background:#121212;border:1px solid #2a2a2a;border-radius:4px;">
        <tr>
          <td style="padding:24px 24px 0 24px;">
            <div style="color:#D4AF37;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;">J.M.A. Motor Service</div>
            <h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px 0;">New service request</h1>
            <p style="color:#a3a3a3;font-size:13px;margin:0 0 16px 0;">A new customer has submitted a service request through the website.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 12px 24px 12px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #2a2a2a;">
              {body_rows}
            </table>
            <p style="color:#666;font-size:11px;margin-top:16px;text-align:center;">Sent automatically from jmamotorservice.ie</p>
          </td>
        </tr>
      </table>
    </div>
    """


async def _send_email_notification(payload: ServiceRequestIn, request_id: str) -> bool:
    """Send notification email via Resend. Returns True on success, False otherwise.

    Designed to NEVER raise — email is best-effort, the request must still succeed
    even if the email service is misconfigured or unreachable.
    """
    if not RESEND_API_KEY:
        logger.info("RESEND_API_KEY not configured — skipping email notification (request still saved).")
        return False
    try:
        import resend  # local import so missing package does not break module load
        resend.api_key = RESEND_API_KEY
        params = {
            "from": SENDER_EMAIL,
            "to": [BUSINESS_EMAIL],
            "subject": f"New service request — {payload.name} ({payload.car_make_model})",
            "html": _build_email_html(payload, request_id),
            "reply_to": payload.email or None,
        }
        # remove None reply_to to avoid SDK complaints
        params = {k: v for k, v in params.items() if v is not None}
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info("Resend email dispatched. id=%s", result.get("id") if isinstance(result, dict) else "?")
        return True
    except Exception as exc:  # noqa: BLE001 - we deliberately swallow all email errors
        logger.warning("Email notification failed (request still saved): %s", exc)
        return False


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@api.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "service": "jma-motor-service",
        "email_configured": bool(RESEND_API_KEY),
        "time": datetime.now(timezone.utc).isoformat(),
    }


@api.get("/")
async def root() -> dict:
    return {"message": "J.M.A. Motor Service API"}


@api.post("/service-requests", response_model=ServiceRequestOut, status_code=status.HTTP_201_CREATED)
async def create_service_request(payload: ServiceRequestIn) -> ServiceRequestOut:
    request_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    document = {
        "id": request_id,
        "name": payload.name,
        "phone": payload.phone,
        "email": payload.email,
        "car_make_model": payload.car_make_model,
        "service_needed": payload.service_needed,
        "preferred_date": payload.preferred_date,
        "message": payload.message,
        "created_at": created_at,
        "email_sent": False,
        "source": "website",
    }

    try:
        await db.service_requests.insert_one(document)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to persist service request: %s", exc)
        raise HTTPException(status_code=500, detail="Could not save your request. Please call us directly.") from exc

    email_sent = await _send_email_notification(payload, request_id)
    if email_sent:
        await db.service_requests.update_one({"id": request_id}, {"$set": {"email_sent": True}})

    return ServiceRequestOut(
        id=request_id,
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        car_make_model=payload.car_make_model,
        service_needed=payload.service_needed,
        preferred_date=payload.preferred_date,
        message=payload.message,
        email_sent=email_sent,
        created_at=created_at,
    )


@api.get("/service-requests", response_model=List[ServiceRequestOut])
async def list_service_requests(limit: int = 50) -> List[ServiceRequestOut]:
    """Admin helper — returns the latest service requests (no auth, intended for owner use)."""
    limit = max(1, min(limit, 200))
    cursor = db.service_requests.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [ServiceRequestOut(**d) for d in docs]


# ---------------------------------------------------------------------------
# App wiring
# ---------------------------------------------------------------------------
app.include_router(api)

cors_origins_env = os.environ.get("CORS_ORIGINS", "*")
allow_origins = ["*"] if cors_origins_env.strip() == "*" else [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def _shutdown() -> None:
    client.close()
