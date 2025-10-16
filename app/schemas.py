from pydantic import BaseModel
from typing import Optional, List

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price_estimate: Optional[float] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    items: List[Item] = []

    class Config:
        orm_mode = True
