# app/models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import enum

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    items = relationship("Item", back_populates="owner", cascade="all, delete-orphan")

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    description = Column(String, nullable=True)
    price_estimate = Column(Float, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="items")

class TradeStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    cancelled = "cancelled"

class Trade(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True, index=True)
    proposer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    proposer_item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    responder_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    responder_item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    status = Column(Enum(TradeStatus), default=TradeStatus.pending, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # optional relationships for convenience
    proposer = relationship("User", foreign_keys=[proposer_id])
    responder = relationship("User", foreign_keys=[responder_id])
