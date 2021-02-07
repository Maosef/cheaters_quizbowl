from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from jose import JWTError, jwt
from passlib.context import CryptContext
import backend.security_config_dev as security_config

from backend.database import Database

from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token/")

db = Database()
router = APIRouter()


def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    # if expires_delta:
    #     expire = datetime.utcnow() + expires_delta
    # else:
    #     expire = datetime.utcnow() + timedelta(minutes=60 * 24 * 2 * 7)
    expire = datetime.utcnow() + timedelta(minutes=60 * 24 * 2 * 7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, security_config.SECRET_KEY, algorithm=security_config.ALGORITHM
    )
    return encoded_jwt


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username, password):
    hashed_password = db.get_password(username)
    if not hashed_password:
        return False
    return verify_password(password, hashed_password)


def decode_token(token):
    decoded_jwt = jwt.decode(
        token, security_config.SECRET_KEY, algorithm=security_config.ALGORITHM
    )
    return decoded_jwt["sub"]


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print("Token {}".format(token))
        payload = jwt.decode(token, security_config.SECRET_KEY, algorithms=[security_config.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        # token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    # user = get_user(fake_users_db, username=token_data.username)
    # if user is None:
    #     raise credentials_exception
    return username

# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     print("Token {}".format(token))
#     payload = jwt.decode(token, security_config.SECRET_KEY, algorithms=[security_config.ALGORITHM])
#     username: str = payload.get("sub")
#     if username is None:
#         raise credentials_exception
#     # token_data = TokenData(username=username)

#     # user = get_user(fake_users_db, username=token_data.username)
#     # if user is None:
#     #     raise credentials_exception
#     return username

@router.get("/users/me")
async def read_users_me(current_user: str = Depends(get_current_user)):
    return current_user

def get_access_token(form_data):
    # user = authenticate_user(form_data.username, form_data.password)
    # if not user:
    #     raise HTTPException(
    #         status_code=401,
    #         detail="Incorrect username or password",
    #         headers={"WWW-Authenticate": "Bearer"},
    #     )
    access_token_expires = timedelta(
        minutes=security_config.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )

    if db.insert_session(form_data.username, access_token):
        print("Authenticated!") 
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        print("error storing session")

@router.post("/register")
async def register(form_data: OAuth2PasswordRequestForm = Depends()):
    print(
        "adding {} {} to database".format(
            form_data.username, pwd_context.hash(form_data.password)
        )
    )

    if db.insert_email_password(
        form_data.username, pwd_context.hash(form_data.password)
    ):
        return get_access_token(form_data)
    print("User already exists")
    return {}

# registers username without password
@router.post("/register_easy")
async def register_easy(form_data: OAuth2PasswordRequestForm = Depends()):
    print(
        "adding {} {} to database".format(
            form_data.username, pwd_context.hash(form_data.password)
        )
    )

    db.insert_user_password(
        form_data.username, pwd_context.hash(form_data.password)
    )
    return get_access_token(form_data)



@router.post("/")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    return get_access_token(form_data)
