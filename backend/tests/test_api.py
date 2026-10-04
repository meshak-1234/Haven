import sys
import os
from fastapi.testclient import TestClient

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.main import app
from backend.app.db.database import Base, engine

# Initialize database tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_full_flow():
    print("--- 1. Testing Health Endpoint ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("Health check OK:", res.json())

    print("\n--- 2. Testing User Registration ---")
    test_email = "testuser@example.com"
    test_password = "SecurePassword123!"
    reg_res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": test_password,
        "full_name": "Alex Mercer"
    })
    if reg_res.status_code == 400 and "already exists" in reg_res.text:
        # User might exist from previous run; test login instead
        print("User already registered, logging in...")
        login_res = client.post("/api/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        auth_data = login_res.json()
    else:
        assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
        auth_data = reg_res.json()

    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Auth successful! User ID:", auth_data["user"]["id"])

    print("\n--- 3. Testing Get User Profile & Settings ---")
    me_res = client.get("/api/users/me", headers=headers)
    assert me_res.status_code == 200, f"Get me failed: {me_res.text}"
    print("User profile retrieved:", me_res.json()["full_name"], "Settings:", me_res.json()["settings"]["preferred_tone"])

    print("\n--- 4. Testing Chat (Normal message) ---")
    chat_res = client.post("/api/chat", headers=headers, json={
        "message": "Hi Haven, I'm feeling a little overwhelmed with work deadlines today."
    })
    assert chat_res.status_code == 200, f"Chat failed: {chat_res.text}"
    chat_data = chat_res.json()
    conv_id = chat_data["conversation_id"]
    print("Chat response received for conversation:", conv_id)
    print("Assistant response snippet:", chat_data["assistant_message"]["content"][:120], "...")

    print("\n--- 5. Testing Safety Escalation Trigger (Crisis detection) ---")
    crisis_res = client.post("/api/chat", headers=headers, json={
        "message": "I don't want to live anymore, I feel like ending my life tonight.",
        "conversation_id": conv_id
    })
    assert crisis_res.status_code == 200, f"Crisis chat failed: {crisis_res.text}"
    crisis_data = crisis_res.json()
    assert crisis_data["assistant_message"]["escalation_triggered"] == True
    assert "988" in crisis_data["assistant_message"]["content"]
    assert crisis_data["safety_analysis"] is not None
    print("Safety system successfully triggered escalation guidance!")
    print("Escalation guidance:", crisis_data["safety_analysis"]["calm_guidance"][:100], "...")

    print("\n--- 6. Testing Memory Management ---")
    # Add memory
    mem_res = client.post("/api/memory", headers=headers, json={
        "content": "I enjoy mindful walking in the mornings to clear my thoughts.",
        "category": "personal_context",
        "importance": 4
    })
    assert mem_res.status_code == 201, f"Memory create failed: {mem_res.text}"
    mem_id = mem_res.json()["id"]
    print("Memory created:", mem_res.json()["content"])

    # Get memories
    get_mems = client.get("/api/memory", headers=headers)
    assert get_mems.status_code == 200
    assert any(m["id"] == mem_id for m in get_mems.json())
    print("Memories count:", len(get_mems.json()))

    # Delete memory
    del_mem = client.delete(f"/api/memory/{mem_id}", headers=headers)
    assert del_mem.status_code == 200
    print("Memory deleted successfully.")

    print("\n--- 7. Testing Conversation List & Deletion ---")
    convs_res = client.get("/api/conversations", headers=headers)
    assert convs_res.status_code == 200
    print("Total user conversations:", len(convs_res.json()))

    # Clear chat messages
    clear_res = client.delete(f"/api/conversations/{conv_id}/messages", headers=headers)
    assert clear_res.status_code == 200
    print("Chat messages cleared:", clear_res.json())

    # Delete conversation
    del_conv = client.delete(f"/api/conversations/{conv_id}", headers=headers)
    assert del_conv.status_code == 200
    print("Conversation deleted successfully.")

    print("\n--- 8. Testing Public Crisis Resources ---")
    resources_res = client.get("/api/safety/resources")
    assert resources_res.status_code == 200
    assert len(resources_res.json()) >= 3
    print("Verified crisis resources count:", len(resources_res.json()))

    print("\n>>> ALL BACKEND SYSTEM TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_full_flow()
