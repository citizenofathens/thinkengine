# FastAPI Google OAuth2 Authentication

This project implements Google OAuth2 authentication in a FastAPI application.

## Setup

1. Create a `.env` file in the root directory with the following variables:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
SECRET_KEY=your_secret_key
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

- `GET /`: Welcome message
- `GET /auth/login`: Initiates Google OAuth2 login
- `GET /auth/callback`: Handles OAuth2 callback
- `GET /auth/user`: Returns authenticated user's email

## Development

To generate a secure SECRET_KEY, you can use the following Python code:
```python
import secrets
print(secrets.token_hex(32))
```