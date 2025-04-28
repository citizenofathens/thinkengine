from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2AuthorizationCodeBearer
from starlette.responses import RedirectResponse
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv
from jose import JWTError, jwt
from datetime import datetime, timedelta
import secrets

# Load environment variables
load_dotenv()

app = FastAPI()

# OAuth2 configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl="https://oauth2.googleapis.com/token"
)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Google OAuth2 Authentication"}

@app.get("/auth/login")
async def login():
    state = secrets.token_urlsafe(32)
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid email&state={state}"
    return RedirectResponse(url=auth_url)

@app.get("/auth/callback")
async def callback(code: str, state: str):
    try:
        # Exchange authorization code for tokens
        token_endpoint = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }
        
        token_response = requests.post(token_endpoint, data=token_data)
        token_response.raise_for_status()
        tokens = token_response.json()

        # Verify ID token
        id_info = id_token.verify_oauth2_token(
            tokens["id_token"], requests.Request(), GOOGLE_CLIENT_ID
        )

        # Create access token
        access_token = create_access_token({"sub": id_info["email"]})
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/auth/user")
async def get_user(current_user: str = Depends(get_current_user)):
    return {"email": current_user}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 