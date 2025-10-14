# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import enum

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price_estimate: Optional[float] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    owner_id: int

    model_config = {"from_attributes": True}  # pydantic v2

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    items: List[Item] = []

    model_config = {"from_attributes": True}

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None

# Trades
class TradeStatusStr(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    cancelled = "cancelled"

class TradeCreate(BaseModel):
    proposer_item_id: int
    responder_item_id: int

class Trade(BaseModel):
    id: int
    proposer_id: int
    proposer_item_id: int
    responder_id: int
    responder_item_id: int
    status: TradeStatusStr
    created_at: datetime

    model_config = {"from_attributes": True}
