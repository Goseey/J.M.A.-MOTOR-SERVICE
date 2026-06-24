"""
J.M.A. Motor Service - Backend API regression tests.
Covers: GET /api/health, POST /api/service-requests (success / validation),
GET /api/service-requests (list), CORS headers, and MongoDB persistence.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback to frontend .env (the public URL we must test against)
    from pathlib import Path
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
assert BASE_URL, "REACT_APP_BACKEND_URL must be configured"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_health_ok(self, client):
        r = client.get(f"{API}/health", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "ok"
        assert "email_configured" in data and isinstance(data["email_configured"], bool)
        # RESEND_API_KEY is intentionally empty in this iteration
        assert data["email_configured"] is False
        assert data.get("service") == "jma-motor-service"

    def test_root_ok(self, client):
        r = client.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "J.M.A." in r.json().get("message", "")


# ---------- CORS ----------
class TestCors:
    def test_cors_preflight(self, client):
        r = requests.options(
            f"{API}/service-requests",
            headers={
                "Origin": "https://example.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
            timeout=15,
        )
        # FastAPI CORSMiddleware should respond 200 with allow-origin
        assert r.status_code in (200, 204), r.text
        assert r.headers.get("access-control-allow-origin") in ("*", "https://example.com")


# ---------- Service Request creation + persistence ----------
class TestServiceRequestCreate:
    def test_create_success_minimum_payload(self, client):
        marker = f"TEST_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": f"TEST Tester {marker}",
            "phone": "085 555 5555",
            "car_make_model": "Toyota Corolla 2019",
            "service_needed": "Full car service",
        }
        r = client.post(f"{API}/service-requests", json=payload, timeout=20)
        assert r.status_code == 201, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 8
        assert data["name"] == payload["name"]
        assert data["phone"] == payload["phone"]
        assert data["car_make_model"] == payload["car_make_model"]
        assert data["service_needed"] == payload["service_needed"]
        # RESEND not configured -> email_sent must be False
        assert data["email_sent"] is False
        assert "created_at" in data and isinstance(data["created_at"], str)
        # No mongo _id leakage
        assert "_id" not in data

        # Verify persistence via list endpoint
        lst = client.get(f"{API}/service-requests?limit=20", timeout=15)
        assert lst.status_code == 200, lst.text
        items = lst.json()
        ids = [i["id"] for i in items]
        assert data["id"] in ids, "created request was not persisted in DB"
        # No _id leakage in list
        for item in items:
            assert "_id" not in item

    def test_create_with_full_payload(self, client):
        payload = {
            "name": "TEST Full Customer",
            "phone": "+353 85 224 6411",
            "email": "test.full@example.com",
            "car_make_model": "Volkswagen Golf 2018",
            "service_needed": "Brake inspection",
            "preferred_date": "2026-02-15",
            "message": "Squealing brakes when stopping.",
        }
        r = client.post(f"{API}/service-requests", json=payload, timeout=20)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["email"] == payload["email"]
        assert data["preferred_date"] == payload["preferred_date"]
        assert data["message"] == payload["message"]
        assert data["email_sent"] is False


# ---------- Service Request validation ----------
class TestServiceRequestValidation:
    def test_missing_required_fields(self, client):
        r = client.post(f"{API}/service-requests", json={}, timeout=15)
        assert r.status_code == 422, r.text
        body = r.json()
        assert "detail" in body

    def test_missing_one_required(self, client):
        payload = {
            "name": "TEST X",
            "phone": "085 555 5555",
            "service_needed": "Diagnostics",
            # car_make_model missing
        }
        r = client.post(f"{API}/service-requests", json=payload, timeout=15)
        assert r.status_code == 422

    def test_invalid_email(self, client):
        payload = {
            "name": "TEST Invalid Email",
            "phone": "085 555 5555",
            "email": "not-an-email",
            "car_make_model": "Toyota Corolla",
            "service_needed": "Diagnostics",
        }
        r = client.post(f"{API}/service-requests", json=payload, timeout=15)
        assert r.status_code == 422, r.text

    def test_name_too_short(self, client):
        payload = {
            "name": "A",
            "phone": "085 555 5555",
            "car_make_model": "Toyota",
            "service_needed": "Diagnostics",
        }
        r = client.post(f"{API}/service-requests", json=payload, timeout=15)
        assert r.status_code == 422


# ---------- List endpoint ----------
class TestServiceRequestList:
    def test_list_limit_and_sort(self, client):
        r = client.get(f"{API}/service-requests?limit=5", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) <= 5
        # sorted desc by created_at
        if len(items) >= 2:
            assert items[0]["created_at"] >= items[-1]["created_at"]
        for it in items:
            assert "_id" not in it
            assert "id" in it
