import requests

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    # 1. Register or Login
    import uuid
    email = f"haven_verifier_{uuid.uuid4().hex[:6]}@example.com"
    pwd = "CompanionPassword123!"
    reg_resp = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": email,
        "password": pwd,
        "full_name": "Companion Verifier"
    })
    assert reg_resp.status_code in [200, 201], f"Registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"[PASS] User registered and authenticated: {email}")

    # 2. Get conversations
    convs_resp = requests.get(f"{BASE_URL}/api/conversations", headers=headers)
    assert convs_resp.status_code == 200, f"Conversations failed: {convs_resp.text}"
    convs = convs_resp.json()
    print(f"[PASS] Retrieved {len(convs)} conversations from MySQL.")
    
    conv_id = convs[0]["id"] if convs else None

    # 3. Send message
    chat_payload = {
        "message": "I've been carrying a lot of stress lately and needed a calm place to reflect.",
        "conversation_id": conv_id
    }
    chat_resp = requests.post(f"{BASE_URL}/api/chat", json=chat_payload, headers=headers)
    assert chat_resp.status_code == 200, f"Chat failed: {chat_resp.text}"
    data = chat_resp.json()
    response_text = data.get("response", "")
    print(f"[PASS] Chat response received ({len(response_text)} chars):")
    print(f"       Preview: {response_text[:140]}...")
    assert len(response_text) > 20, "Response is too short!"
    assert not response_text.endswith("..."), "Response seems prematurely cut off!"
    print("[PASS] All verification assertions passed!")

if __name__ == "__main__":
    test_flow()
